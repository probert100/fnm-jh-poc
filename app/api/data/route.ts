import { NextRequest, NextResponse } from 'next/server';
import { realtimeDb } from '../../../lib/firebase-admin';

// Sanitize username for Firebase path (dots not allowed)
function sanitizeForFirebase(str: string): string {
    return str
        .replace(/\./g, ',')  // Firebase convention: replace . with ,
        .replace(/[#$\[\]]/g, '_');  // Replace other invalid chars
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, uri, phoneNumber } = body;

        if (!username) {
            return NextResponse.json({
                status: 'error',
                message: 'username is required'
            }, { status: 400 });
        }

        // Sanitize username for Firebase path
        const sanitizedUsername = sanitizeForFirebase(username);

        // Write to Firebase Realtime DB under /screenPops/{username}/{messageId}
        const ref = realtimeDb.ref(`screenPops/${sanitizedUsername}`);
        const newMessageRef = ref.push();

        await newMessageRef.set({
            uri,
            phoneNumber,
            timestamp: Date.now(),
            processed: false
        });

        return NextResponse.json({
            status: 'success',
            messageId: newMessageRef.key,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Firebase write error:', error);
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
