import { create } from 'zustand';
import * as firebaseService from './services/firebaseService';

export type Category = 'A' | 'B' | 'C' | 'D';

export type Stage = 'current_best' | 'workshopping' | 'ready_to_go' | 'archived';

export const CATEGORY_STRUCTURE: Record<
  Category,
  { emoji: string; label: string; pages: string[] }
> = {
  A: {
    emoji: '✨',
    label: 'Client Experience',
    pages: ['Onboarding', 'First Meeting', 'Year 1', 'Portal Design'],
  },
  B: {
    emoji: '⚙️',
    label: 'Operations & Tech',
    pages: ['Wealthbox', 'RightCapital', 'Automation', 'Data Flows'],
  },
  C: {
    emoji: '🚀',
    label: 'Marketing & Growth',
    pages: ['Landing Page', 'Postcards', 'Fee Calculator', 'Messaging'],
  },
  D: {
    emoji: '🧠',
    label: 'Logic & Compliance',
    pages: ['Asset Allocation', 'Models', 'ADV Filings', 'Policies'],
  },
};

export interface Idea {
  id: string;
  text: string;
  category: Category;
  subcategory: string;
  timestamp: number;
  refined?: boolean;
  stage: Stage;
  pinned?: boolean;
  focused?: boolean;
  type: 'idea' | 'question';
  goal: string;
  images: string[];
  notes: { id: string; text: string; timestamp: number }[];
}

type IdeaInput = Omit<Idea, 'id' | 'timestamp' | 'pinned' | 'stage'> &
  Partial<Pick<Idea, 'id' | 'timestamp' | 'pinned' | 'stage'>>;

interface IdeaStore {
  ideas: Idea[];
  isLoading: boolean;
  error: string | null;
  setIdeas: (ideas: Idea[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadIdeas: () => Promise<void>;
  addIdea: (idea: IdeaInput) => Promise<void>;
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<void>;
  removeIdea: (id: string) => Promise<void>;
  setIdeaStage: (id: string, stage: Stage) => Promise<void>;
  toggleIdeaPinned: (id: string) => Promise<void>;
  toggleIdeaFocus: (id: string, category: Category, subcategory: string) => Promise<void>;
}

const SEED_DATA: Idea[] = [
  {
    id: '1',
    text: "Draft the 'Zero-Entry' upload flow for brokerage PDFs",
    category: 'A',
    subcategory: 'Onboarding',
    timestamp: Date.now(),
    type: 'idea',
    refined: false,
    stage: 'workshopping',
    pinned: false,
    goal: '',
    images: [],
    notes: [],
  },
  {
    id: '2',
    text: "Script the 'Dream Retirement' opening question",
    category: 'A',
    subcategory: 'Onboarding',
    timestamp: Date.now(),
    type: 'idea',
    refined: false,
    stage: 'workshopping',
    pinned: false,
    goal: '',
    images: [],
    notes: [],
  },
];

export const useIdeaStore = create<IdeaStore>()((set, get) => ({
  ideas: [],
  isLoading: true,
  error: null,

  setIdeas: (ideas) => set({ ideas }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  loadIdeas: async () => {
    set({ isLoading: true, error: null });
    try {
      let ideas = await firebaseService.getIdeas();
      
      // If no ideas in Firestore, seed with initial data
      if (ideas.length === 0) {
        await firebaseService.seedInitialData(SEED_DATA);
        ideas = SEED_DATA;
      }
      
      set({ ideas, isLoading: false });
    } catch (error) {
      console.error('Failed to load ideas from Firebase:', error);
      set({ 
        error: 'Failed to load data. Please check your connection.', 
        isLoading: false 
      });
    }
  },

  addIdea: async (ideaInput) => {
    const idea: Idea = {
      id: ideaInput.id ?? crypto.randomUUID(),
      text: ideaInput.text,
      category: ideaInput.category,
      subcategory: ideaInput.subcategory,
      timestamp: ideaInput.timestamp ?? Date.now(),
      refined: ideaInput.refined ?? false,
      stage: ideaInput.stage ?? 'workshopping',
      pinned: ideaInput.pinned ?? false,
      focused: ideaInput.focused ?? false,
      type: ideaInput.type,
      goal: ideaInput.goal ?? '',
      images: ideaInput.images ?? [],
      notes: ideaInput.notes ?? [],
    };

    // Optimistic update
    set((state) => ({ ideas: [...state.ideas, idea] }));

    try {
      await firebaseService.addIdea(idea);
    } catch (error) {
      console.error('Failed to add idea to Firebase:', error);
      // Rollback on error
      set((state) => ({ ideas: state.ideas.filter((i) => i.id !== idea.id) }));
    }
  },

  updateIdea: async (id, updates) => {
    const { ideas } = get();
    const originalIdea = ideas.find((i) => i.id === id);

    // Optimistic update
    set((state) => ({
      ideas: state.ideas.map((idea) =>
        idea.id === id ? { ...idea, ...updates } : idea
      ),
    }));

    try {
      await firebaseService.updateIdea(id, updates);
    } catch (error) {
      console.error('Failed to update idea in Firebase:', error);
      // Rollback on error
      if (originalIdea) {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id ? originalIdea : idea
          ),
        }));
      }
    }
  },

  removeIdea: async (id) => {
    const { ideas } = get();
    const removedIdea = ideas.find((i) => i.id === id);

    // Optimistic update
    set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) }));

    try {
      await firebaseService.deleteIdea(id);
    } catch (error) {
      console.error('Failed to remove idea from Firebase:', error);
      // Rollback on error
      if (removedIdea) {
        set((state) => ({ ideas: [...state.ideas, removedIdea] }));
      }
    }
  },

  setIdeaStage: async (id, stage) => {
    await get().updateIdea(id, { stage });
  },

  toggleIdeaPinned: async (id) => {
    const { ideas } = get();
    const idea = ideas.find((i) => i.id === id);
    if (idea) {
      await get().updateIdea(id, { pinned: !idea.pinned });
    }
  },

  toggleIdeaFocus: async (id, category, subcategory) => {
    const { ideas } = get();
    const targetIdea = ideas.find((idea) => idea.id === id);
    const isCurrentlyFocused = targetIdea?.focused === true;

    // Calculate the updates needed
    const updates: { id: string; changes: Partial<Idea> }[] = [];

    if (isCurrentlyFocused) {
      // If already focused, just remove focus from this card
      updates.push({ id, changes: { focused: false } });
    } else {
      // Remove focus from all other cards in the same Workshopping section
      // and set focus on the clicked card
      ideas.forEach((idea) => {
        const isSameSection =
          idea.stage === 'workshopping' &&
          idea.category === category &&
          idea.subcategory === subcategory;

        if (idea.id === id) {
          updates.push({ id: idea.id, changes: { focused: true } });
        } else if (isSameSection && idea.focused) {
          updates.push({ id: idea.id, changes: { focused: false } });
        }
      });
    }

    // Optimistic update
    set((state) => ({
      ideas: state.ideas.map((idea) => {
        const update = updates.find((u) => u.id === idea.id);
        return update ? { ...idea, ...update.changes } : idea;
      }),
    }));

    try {
      await firebaseService.batchUpdateIdeas(updates);
    } catch (error) {
      console.error('Failed to update focus in Firebase:', error);
      // Reload from Firebase to get correct state
      get().loadIdeas();
    }
  },
}));
