// Use dynamic imports to avoid Turbopack bundling issues with firebase-admin
import type { App } from 'firebase-admin/app';
import type { Database } from 'firebase-admin/database';

let app: App | undefined;
let db: Database | undefined;

async function getApp(): Promise<App> {
    if (!app) {
        const { initializeApp, getApps, cert } = await import('firebase-admin/app');
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

async function getDb(): Promise<Database> {
    if (!db) {
        const { getDatabase } = await import('firebase-admin/database');
        db = getDatabase(await getApp());
    }
    return db;
}

export const realtimeDb = {
    ref: async (path: string) => {
        const database = await getDb();
        return database.ref(path);
    }
};
