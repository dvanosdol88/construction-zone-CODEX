import { create } from 'zustand';
import * as consultantService from './services/consultantService';
import type { CanonDoc } from './services/consultantService';

// Re-export types for convenience
export type {
  CanonDoc,
  ConsultantSettings,
} from './services/consultantService';

interface ConsultantStore {
  // --- Canon State ---
  canonDocs: CanonDoc[];
  isCanonLoading: boolean;
  canonError: string | null;

  // --- Settings State ---
  userContext: string;
  projectConstraints: string;
  isSettingsLoading: boolean;
  settingsError: string | null;

  // --- Canon Actions ---
  loadCanon: () => Promise<void>;
  addCanonDoc: (title: string, content: string) => Promise<void>;
  deleteCanonDoc: (id: string) => Promise<void>;

  // --- Settings Actions ---
  loadSettings: () => Promise<void>;
  saveSettings: (
    userContext: string,
    projectConstraints: string
  ) => Promise<void>;

  // --- Combined Loader ---
  loadAll: () => Promise<void>;
}

export const useConsultantStore = create<ConsultantStore>()((set, get) => ({
  // --- Initial State ---
  canonDocs: [],
  isCanonLoading: true,
  canonError: null,

  userContext: consultantService.DEFAULT_USER_CONTEXT,
  projectConstraints: consultantService.DEFAULT_PROJECT_CONSTRAINTS,
  isSettingsLoading: true,
  settingsError: null,

  // --- Canon Actions ---

  loadCanon: async () => {
    set({ isCanonLoading: true, canonError: null });
    try {
      let docs = await consultantService.getCanonDocs();

      // Seed default canon if empty
      if (docs.length === 0) {
        await consultantService.seedCanonDocs(
          consultantService.DEFAULT_CANON_DOCS
        );
        docs = consultantService.DEFAULT_CANON_DOCS;
      }

      set({ canonDocs: docs, isCanonLoading: false });
    } catch (error) {
      console.error('Failed to load canon from Firebase:', error);
      set({
        canonError: 'Failed to load Knowledge Base.',
        isCanonLoading: false,
        // Fall back to defaults so UI isn't empty
        canonDocs: consultantService.DEFAULT_CANON_DOCS,
      });
    }
  },

  addCanonDoc: async (title: string, content: string) => {
    const newDoc: CanonDoc = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: Date.now(),
    };

    // Optimistic update
    set((state) => ({ canonDocs: [...state.canonDocs, newDoc] }));

    try {
      await consultantService.addCanonDoc(newDoc);
    } catch (error) {
      console.error('Failed to add canon doc to Firebase:', error);
      // Rollback
      set((state) => ({
        canonDocs: state.canonDocs.filter((d) => d.id !== newDoc.id),
      }));
    }
  },

  deleteCanonDoc: async (id: string) => {
    const { canonDocs } = get();
    const removedDoc = canonDocs.find((d) => d.id === id);

    // Optimistic update
    set((state) => ({
      canonDocs: state.canonDocs.filter((d) => d.id !== id),
    }));

    try {
      await consultantService.deleteCanonDoc(id);
    } catch (error) {
      console.error('Failed to delete canon doc from Firebase:', error);
      // Rollback
      if (removedDoc) {
        set((state) => ({ canonDocs: [...state.canonDocs, removedDoc] }));
      }
    }
  },

  // --- Settings Actions ---

  loadSettings: async () => {
    set({ isSettingsLoading: true, settingsError: null });
    try {
      const settings = await consultantService.getSettings();

      if (settings) {
        set({
          userContext: settings.userContext,
          projectConstraints: settings.projectConstraints,
          isSettingsLoading: false,
        });
      } else {
        // No saved settings - use defaults (already set in initial state)
        // Optionally persist defaults to Firebase
        await consultantService.saveSettings({
          userContext: consultantService.DEFAULT_USER_CONTEXT,
          projectConstraints: consultantService.DEFAULT_PROJECT_CONSTRAINTS,
          updatedAt: Date.now(),
        });
        set({ isSettingsLoading: false });
      }
    } catch (error) {
      console.error('Failed to load settings from Firebase:', error);
      set({
        settingsError: 'Failed to load settings.',
        isSettingsLoading: false,
        // Defaults are already set, so UI will work
      });
    }
  },

  saveSettings: async (userContext: string, projectConstraints: string) => {
    const previousContext = get().userContext;
    const previousConstraints = get().projectConstraints;

    // Optimistic update
    set({ userContext, projectConstraints });

    try {
      await consultantService.saveSettings({
        userContext,
        projectConstraints,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save settings to Firebase:', error);
      // Rollback
      set({
        userContext: previousContext,
        projectConstraints: previousConstraints,
      });
    }
  },

  // --- Combined Loader ---

  loadAll: async () => {
    await Promise.all([get().loadCanon(), get().loadSettings()]);
  },
}));
