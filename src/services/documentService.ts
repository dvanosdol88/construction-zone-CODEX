import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

const COLLECTION_NAME = 'documents';

export interface DocumentMeta {
  id: string;
  filename: string;
  fileType: string;
  size: number;
  uploadedAt: number;
  storageUrl: string;
  linkedCards: string[];
  isCanonical: boolean;
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Upload a document to Firebase Storage and save metadata to Firestore
 */
export async function uploadDocument(file: File): Promise<DocumentMeta> {
  const id = crypto.randomUUID();
  const storagePath = `documents/${id}-${file.name}`;
  const storageRef = ref(storage, storagePath);

  // Upload file to Storage
  await uploadBytes(storageRef, file);
  const storageUrl = await getDownloadURL(storageRef);

  // Create metadata
  const docMeta: DocumentMeta = {
    id,
    filename: file.name,
    fileType: getFileExtension(file.name),
    size: file.size,
    uploadedAt: Date.now(),
    storageUrl,
    linkedCards: [],
    isCanonical: false,
  };

  // Save to Firestore
  const docRef = doc(db, COLLECTION_NAME, id);
  await setDoc(docRef, docMeta);

  return docMeta;
}

/**
 * Get all documents from Firestore
 */
export async function getDocuments(): Promise<DocumentMeta[]> {
  const docsCollection = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(docsCollection);

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as DocumentMeta[];
}

/**
 * Delete a document from Storage and Firestore
 */
export async function deleteDocument(docMeta: DocumentMeta): Promise<void> {
  // Delete from Storage
  const storagePath = `documents/${docMeta.id}-${docMeta.filename}`;
  const storageRef = ref(storage, storagePath);
  
  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Could not delete from storage:', error);
  }

  // Delete from Firestore
  const docRef = doc(db, COLLECTION_NAME, docMeta.id);
  await deleteDoc(docRef);
}

/**
 * Update document metadata
 */
export async function updateDocument(
  id: string,
  updates: Partial<DocumentMeta>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updates);
}

/**
 * Toggle canonical status
 */
export async function toggleCanonical(id: string, isCanonical: boolean): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, { isCanonical });
}

/**
 * Link a document to a card
 */
export async function linkDocumentToCard(docId: string, cardId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, docId);
  await updateDoc(docRef, {
    linkedCards: arrayUnion(cardId),
  });
}

/**
 * Unlink a document from a card
 */
export async function unlinkDocumentFromCard(docId: string, cardId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, docId);
  await updateDoc(docRef, {
    linkedCards: arrayRemove(cardId),
  });
}

