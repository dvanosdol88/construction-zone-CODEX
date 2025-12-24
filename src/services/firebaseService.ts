import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { Idea, Category } from '../ideaStore';

const COLLECTION_NAME = 'ideas';

/**
 * Get all ideas from Firestore
 */
export async function getIdeas(): Promise<Idea[]> {
  const ideasCollection = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(ideasCollection);
  
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Idea[];
}

/**
 * Add a new idea to Firestore
 */
export async function addIdea(idea: Idea): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, idea.id);
  await setDoc(docRef, idea);
}

/**
 * Update an existing idea in Firestore
 */
export async function updateIdea(id: string, updates: Partial<Idea>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updates);
}

/**
 * Delete an idea from Firestore
 */
export async function deleteIdea(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Batch update multiple ideas (used for toggleIdeaFocus)
 */
export async function batchUpdateIdeas(
  updates: { id: string; changes: Partial<Idea> }[]
): Promise<void> {
  const batch = writeBatch(db);
  
  for (const { id, changes } of updates) {
    const docRef = doc(db, COLLECTION_NAME, id);
    batch.update(docRef, changes);
  }
  
  await batch.commit();
}

/**
 * Seed initial data to Firestore (only if collection is empty)
 */
export async function seedInitialData(seedData: Idea[]): Promise<void> {
  const batch = writeBatch(db);
  
  for (const idea of seedData) {
    const docRef = doc(db, COLLECTION_NAME, idea.id);
    batch.set(docRef, idea);
  }
  
  await batch.commit();
}

