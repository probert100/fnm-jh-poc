import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onChildAdded, remove, DataSnapshot } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBbtDFGf6GPTMtowZoCqy6Mz8Rvs9sjfVs",
  authDomain: "fnm-jh-ivi.firebaseapp.com",
  databaseURL: "https://fnm-jh-ivi-default-rtdb.firebaseio.com",
  projectId: "fnm-jh-ivi",
  storageBucket: "fnm-jh-ivi.firebasestorage.app",
  messagingSenderId: "895382657518",
  appId: "1:895382657518:web:cb3ae9380eb1420fa556ff",
  measurementId: "G-RGZXX3RSWV"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Sanitize username for Firebase path (dots not allowed)
function sanitizeForFirebase(str: string): string {
  return str
    .replace(/\./g, ',')
    .replace(/[#$\[\]]/g, '_');
}

export interface ScreenPopData {
  uri?: string;
  phoneNumber?: string;
  timestamp: number;
  processed: boolean;
}

export type ScreenPopHandler = (data: ScreenPopData, messageId: string) => void;

export function subscribeToScreenPops(
  username: string,
  onScreenPop: ScreenPopHandler
): () => void {
  const sanitizedUsername = sanitizeForFirebase(username);
  const screenPopsRef = ref(db, `screenPops/${sanitizedUsername}`);

  const unsubscribe = onChildAdded(screenPopsRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val() as ScreenPopData;
    const messageId = snapshot.key;

    if (data && !data.processed && messageId) {
      onScreenPop(data, messageId);
    }
  });

  return unsubscribe;
}

export async function removeScreenPop(
  username: string,
  messageId: string
): Promise<void> {
  const sanitizedUsername = sanitizeForFirebase(username);
  const messageRef = ref(db, `screenPops/${sanitizedUsername}/${messageId}`);

  await remove(messageRef);
}
