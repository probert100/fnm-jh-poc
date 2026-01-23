// Use Firebase REST API to avoid Turbopack bundling issues with firebase-admin SDK
// Uses GCP metadata server for auth when running on Cloud Run, falls back to service account

let cachedAccessToken: { token: string; expiry: number } | null = null;

async function getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 5 min buffer)
    if (cachedAccessToken && cachedAccessToken.expiry > Date.now() + 300000) {
        return cachedAccessToken.token;
    }

    // Try GCP metadata server first (works on Cloud Run, Cloud Functions, GCE)
    try {
        const metadataResponse = await fetch(
            'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
            {
                headers: { 'Metadata-Flavor': 'Google' }
            }
        );

        if (metadataResponse.ok) {
            const data = await metadataResponse.json();
            cachedAccessToken = {
                token: data.access_token,
                expiry: Date.now() + ((data.expires_in || 3600) * 1000)
            };
            return cachedAccessToken.token;
        }
    } catch {
        // Metadata server not available (local development)
        console.log('GCP metadata server not available, trying service account credentials');
    }

    // Fall back to service account credentials for local development
    return getAccessTokenFromServiceAccount();
}

async function getAccessTokenFromServiceAccount(): Promise<string> {
    const projectId = process.env.FB_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FB_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Missing Firebase credentials. Set FB_ADMIN_PROJECT_ID, FB_ADMIN_CLIENT_EMAIL, and FB_ADMIN_PRIVATE_KEY');
    }

    const crypto = await import('crypto');

    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: clientEmail,
        sub: clientEmail,
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
        scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email'
    };

    const base64url = (input: string): string =>
        Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(privateKey, 'base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const jwt = `${signatureInput}.${signature}`;

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    cachedAccessToken = {
        token: data.access_token,
        expiry: Date.now() + (data.expires_in * 1000)
    };

    return cachedAccessToken.token;
}

function getDatabaseURL(): string {
    // Check explicit env vars first
    let url = process.env.FB_ADMIN_DATABASE_URL || process.env.FIREBASE_DATABASE_URL;

    // Fall back to parsing FIREBASE_CONFIG (set automatically on Cloud Run)
    if (!url && process.env.FIREBASE_CONFIG) {
        try {
            const config = JSON.parse(process.env.FIREBASE_CONFIG);
            url = config.databaseURL;
        } catch {
            // Invalid JSON, ignore
        }
    }

    if (!url) {
        throw new Error('Missing Firebase database URL in environment variables');
    }
    return url;
}

export const realtimeDb = {
    ref: (path: string) => {
        return {
            push: () => {
                const pushId = generatePushId();
                return {
                    key: pushId,
                    set: async (data: Record<string, unknown>) => {
                        const accessToken = await getAccessToken();
                        const databaseURL = getDatabaseURL();
                        const url = `${databaseURL}/${path}/${pushId}.json?access_token=${accessToken}`;

                        const response = await fetch(url, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });

                        if (!response.ok) {
                            const error = await response.text();
                            throw new Error(`Firebase write failed: ${error}`);
                        }

                        return response.json();
                    }
                };
            }
        };
    }
};

// Firebase Push ID generator (same algorithm as Firebase SDK)
function generatePushId(): string {
    const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
    let now = Date.now();
    const timeStampChars = new Array(8);

    for (let i = 7; i >= 0; i--) {
        timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
        now = Math.floor(now / 64);
    }

    let id = timeStampChars.join('');

    for (let i = 0; i < 12; i++) {
        id += PUSH_CHARS.charAt(Math.floor(Math.random() * 64));
    }

    return id;
}
