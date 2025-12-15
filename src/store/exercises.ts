import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'core' | 'flexibility' | 'balance';
  muscle_groups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  video_url?: string;
  image_url?: string;
  rating: number;
  favorites: number;
  calories_per_minute: number;
}

interface ExerciseState {
  exercises: Exercise[];
  favorites: Set<string>;
  recentExercises: string[];
  
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addToRecent: (id: string) => void;
  getExercise: (id: string) => Exercise | undefined;
  getFavorites: () => Exercise[];
  getRecent: () => Exercise[];
}

const defaultExercises: Exercise[] = [
  {
    id: '1',
    name: 'Push-ups',
    category: 'strength',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Start in a plank position, lower your body until your chest nearly touches the floor, then push back up.',
    video_url: 'https://example.com/pushups',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    rating: 4.8,
    favorites: 1250,
    calories_per_minute: 8
  },
  {
    id: '2',
    name: 'Squats',
    category: 'strength',
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Stand with feet shoulder-width apart, lower your body as if sitting back into a chair, then return to standing.',
    video_url: 'https://example.com/squats',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    rating: 4.9,
    favorites: 2100,
    calories_per_minute: 10
  },
  {
    id: '3',
    name: 'Deadlift',
    category: 'strength',
    muscle_groups: ['back', 'glutes', 'hamstrings'],
    equipment: ['barbell', 'dumbbells'],
    difficulty: 'intermediate',
    instructions: 'Stand with feet hip-width apart, bend at hips and knees to lower hands to bar, then stand up while keeping bar close to body.',
    video_url: 'https://example.com/deadlift',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    rating: 4.7,
    favorites: 890,
    calories_per_minute: 12
  },
  {
    id: '4',
    name: 'Bench Press',
    category: 'strength',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    instructions: 'Lie on bench, lower bar to chest, then press back up to starting position.',
    video_url: 'https://example.com/benchpress',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    rating: 4.6,
    favorites: 750,
    calories_per_minute: 11
  },
  {
    id: '5',
    name: 'Pull-ups',
    category: 'strength',
    muscle_groups: ['back', 'biceps'],
    equipment: ['pull-up bar'],
    difficulty: 'advanced',
    instructions: 'Hang from pull-up bar, pull your body up until chin is over bar, then lower back down.',
    video_url: 'https://example.com/pullups',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    rating: 4.5,
    favorites: 680,
    calories_per_minute: 9
  },
  {
    id: '6',
    name: 'Plank',
    category: 'core',
    muscle_groups: ['core', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Hold a plank position with body in a straight line from head to heels.',
    video_url: 'https://example.com/plank',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    rating: 4.8,
    favorites: 1500,
    calories_per_minute: 4
  },
  {
    id: '7',
    name: 'Burpees',
    category: 'cardio',
    muscle_groups: ['full body'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions: 'Combine a squat, push-up, and jump in one fluid movement.',
    video_url: 'https://example.com/burpees',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    rating: 4.4,
    favorites: 920,
    calories_per_minute: 15
  },
  {
    id: '8',
    name: 'Lunges',
    category: 'strength',
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Step forward with one leg, lower your body until both knees are bent at 90 degrees, then return to starting position.',
    video_url: 'https://example.com/lunges',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    rating: 4.7,
    favorites: 1100,
    calories_per_minute: 8
  }
];

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      exercises: defaultExercises,
      favorites: new Set<string>(),
      recentExercises: [],

      addExercise: (exercise) => {
        set((state) => ({
          exercises: [...state.exercises, exercise],
        }));
      },

      updateExercise: (id, updates) => {
        set((state) => ({
          exercises: state.exercises.map((ex) =>
            ex.id === id ? { ...ex, ...updates } : ex
          ),
        }));
      },

      deleteExercise: (id) => {
        set((state) => ({
          exercises: state.exercises.filter((ex) => ex.id !== id),
          favorites: new Set([...state.favorites].filter((favId) => favId !== id)),
        }));
      },

      toggleFavorite: (id) => {
        set((state) => {
          const newFavorites = new Set(state.favorites);
          if (newFavorites.has(id)) {
            newFavorites.delete(id);
          } else {
            newFavorites.add(id);
          }
          return { favorites: newFavorites };
        });
      },

      addToRecent: (id) => {
        set((state) => {
          const recent = [id, ...state.recentExercises.filter((exId) => exId !== id)].slice(0, 10);
          return { recentExercises: recent };
        });
      },

      getExercise: (id) => {
        return get().exercises.find((ex) => ex.id === id);
      },

      getFavorites: () => {
        const { exercises, favorites } = get();
        return exercises.filter((ex) => favorites.has(ex.id));
      },

      getRecent: () => {
        const { exercises, recentExercises } = get();
        return recentExercises
          .map((id) => exercises.find((ex) => ex.id === id))
          .filter((ex): ex is Exercise => ex !== undefined);
      },
    }),
    {
      name: 'exercises-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Migration logic for future structure changes
        if (version === 0) {
          return {
            ...persistedState,
            exercises: persistedState.exercises || defaultExercises,
            favorites: persistedState.favorites || [],
            recentExercises: persistedState.recentExercises || [],
          };
        }
        return persistedState;
      },
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            // Validate structure
            if (!parsed.state) {
              console.warn(`[Exercise Store] Invalid localStorage structure for ${name}, resetting...`);
              return null;
            }
            // If user has saved exercises, use those; otherwise use defaults
            const savedExercises = parsed.state.exercises;
            const hasUserExercises = Array.isArray(savedExercises) && savedExercises.length > 0;
            
            return {
              state: {
                ...parsed.state,
                // Only use defaults if no user exercises exist
                exercises: hasUserExercises ? savedExercises : defaultExercises,
                favorites: new Set(parsed.state.favorites || []),
                recentExercises: parsed.state.recentExercises || [],
              },
              version: parsed.version || 0,
            };
          } catch (error) {
            console.error(`[Exercise Store] Failed to parse localStorage for ${name}:`, error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            const serialized = {
              state: {
                ...value.state,
                favorites: Array.from(value.state.favorites),
              },
              version: value.version || 1,
            };
            localStorage.setItem(name, JSON.stringify(serialized));
          } catch (error) {
            console.error(`[Exercise Store] Failed to save to localStorage for ${name}:`, error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error(`[Exercise Store] Failed to remove from localStorage for ${name}:`, error);
          }
        },
      },
    }
  )
);

