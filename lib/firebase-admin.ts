// Use Firebase REST API to avoid Turbopack bundling issues with firebase-admin SDK
// This uses service account authentication via Google OAuth2

interface ServiceAccountCredentials {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

let cachedAccessToken: { token: string; expiry: number } | null = null;

function getCredentials(): ServiceAccountCredentials {
    const projectId = process.env.FB_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FB_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Missing Firebase credentials in environment variables');
    }

    return { projectId, clientEmail, privateKey };
}

function base64url(input: string): string {
    return Buffer.from(input)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function createJWT(credentials: ServiceAccountCredentials): Promise<string> {
    const crypto = await import('crypto');

    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: credentials.clientEmail,
        sub: credentials.clientEmail,
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
        scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email'
    };

    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(credentials.privateKey, 'base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    return `${signatureInput}.${signature}`;
}

async function getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 5 min buffer)
    if (cachedAccessToken && cachedAccessToken.expiry > Date.now() + 300000) {
        return cachedAccessToken.token;
    }

    const credentials = getCredentials();
    const jwt = await createJWT(credentials);

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
    const url = process.env.FB_ADMIN_DATABASE_URL || process.env.FIREBASE_DATABASE_URL;
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
