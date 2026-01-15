import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';

let app: App | undefined;
let db: Database | undefined;

function getApp(): App {
    if (!app) {
        if (getApps().length === 0) {
            app = initializeApp({
                credential: cert({
                    projectId: process.env.FB_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FB_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: (process.env.FB_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
                }),
                databaseURL: process.env.FB_ADMIN_DATABASE_URL || process.env.FIREBASE_DATABASE_URL,
            });
        } else {
            app = getApps()[0];
        }
    }
    return app;
}

export const realtimeDb = {
    ref: (path: string) => {
        if (!db) {
            db = getDatabase(getApp());
        }
        return db.ref(path);
    }
};
