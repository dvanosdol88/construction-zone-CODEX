import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// --- TYPES ---

export interface CanonDoc {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface ConsultantSettings {
  userContext: string;
  projectConstraints: string;
  updatedAt: number;
}

// --- COLLECTION NAMES ---

const CANON_COLLECTION = 'consultant_canon';
const SETTINGS_DOC_PATH = 'consultant_settings/default';

// --- DEFAULT VALUES ---

export const DEFAULT_USER_CONTEXT =
  "I am David, a CFA & CFP professional. I prefer concise, technical answers. I am building a technology-first RIA.";

export const DEFAULT_PROJECT_CONSTRAINTS =
`Budget: Low-cost/Bootstrapped.
Timeline: Launch in 3 months.
Location: Connecticut.
Key Tech: Wealthbox, Altruist.

STRICT RESTRICTIONS (DO NOT USE/SUGGEST):
- Vendors: Advyzon, FP Alpha, Salesforce.
- Tools: Notion, Figma.`;

export const DEFAULT_CANON_DOCS: CanonDoc[] = [
  {
    id: 'master-index',
    title: 'Master Index',
    content: '1. Compliance First.\n2. Tech-enabled workflows.\n3. Low overhead.',
    createdAt: Date.now(),
  },
];

// --- CANON DOCUMENT OPERATIONS ---

/**
 * Get all canon documents from Firestore
 */
export async function getCanonDocs(): Promise<CanonDoc[]> {
  const canonCollection = collection(db, CANON_COLLECTION);
  const snapshot = await getDocs(canonCollection);

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as CanonDoc[];
}

/**
 * Add a new canon document to Firestore
 */
export async function addCanonDoc(canonDoc: CanonDoc): Promise<void> {
  const docRef = doc(db, CANON_COLLECTION, canonDoc.id);
  await setDoc(docRef, canonDoc);
}

/**
 * Delete a canon document from Firestore
 */
export async function deleteCanonDoc(id: string): Promise<void> {
  const docRef = doc(db, CANON_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Seed default canon documents (only if collection is empty)
 */
export async function seedCanonDocs(docs: CanonDoc[]): Promise<void> {
  for (const canonDoc of docs) {
    const docRef = doc(db, CANON_COLLECTION, canonDoc.id);
    await setDoc(docRef, canonDoc);
  }
}

// --- SETTINGS OPERATIONS ---

/**
 * Get consultant settings from Firestore
 * Returns null if no settings exist yet
 */
export async function getSettings(): Promise<ConsultantSettings | null> {
  const docRef = doc(db, ...SETTINGS_DOC_PATH.split('/'));
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as ConsultantSettings;
}

/**
 * Save consultant settings to Firestore
 */
export async function saveSettings(settings: ConsultantSettings): Promise<void> {
  const docRef = doc(db, ...SETTINGS_DOC_PATH.split('/'));
  await setDoc(docRef, settings);
}
