import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Firestore collection names
export const COLLECTIONS = {
  TENANTS: 'tenants',
  STAFF: 'staff',
  SERVICES: 'services',
  APPOINTMENTS: 'appointments',
  CLIENTS: 'clients',
  REWARDS: 'rewards',
  COUPONS: 'coupons',
  MESSAGES: 'messages',
  USERS: 'users',
} as const;

// Generic helper to subscribe to a collection in real time
export function subscribeToCollection<T>(
  collectionName: string,
  onUpdate: (items: T[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as T[];
      onUpdate(items);
    },
    (err) => {
      console.error(`Erro ao sincronizar coleção ${collectionName}:`, err);
      if (onError) onError(err);
    }
  );
}

// Save or overwrite a document
export async function saveDocument(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error(`Erro ao salvar documento em ${collectionName}/${docId}:`, error);
    throw error;
  }
}

// Delete a document
export async function deleteDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Erro ao deletar documento em ${collectionName}/${docId}:`, error);
    throw error;
  }
}

// Reset/Clean all fictitious data in Firestore
export async function resetDatabaseToCleanState() {
  const collectionsToClear = [
    COLLECTIONS.TENANTS,
    COLLECTIONS.STAFF,
    COLLECTIONS.SERVICES,
    COLLECTIONS.APPOINTMENTS,
    COLLECTIONS.CLIENTS,
    COLLECTIONS.REWARDS,
    COLLECTIONS.COUPONS,
    COLLECTIONS.MESSAGES,
  ];

  for (const colName of collectionsToClear) {
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
