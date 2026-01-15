import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const firebaseAdminConfig = {
    credential: cert({
        projectId: process.env.FB_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FB_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FB_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FB_ADMIN_DATABASE_URL || process.env.FIREBASE_DATABASE_URL,
};

// Initialize Firebase Admin only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

export const realtimeDb = getDatabase(app);
