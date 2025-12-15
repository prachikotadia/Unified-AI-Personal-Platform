import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  notes?: string;
  bodyPart?: 'front' | 'back' | 'side' | 'full_body';
  weight?: number;
  createdAt: string;
}

interface ProgressPhotosState {
  photos: ProgressPhoto[];
  addPhoto: (photo: Omit<ProgressPhoto, 'id' | 'createdAt'>) => void;
  removePhoto: (id: string) => void;
  updatePhoto: (id: string, updates: Partial<ProgressPhoto>) => void;
  getPhotosByDate: (date: string) => ProgressPhoto[];
  getLatestPhoto: () => ProgressPhoto | null;
  clearAllPhotos: () => void;
}

export const useProgressPhotosStore = create<ProgressPhotosState>()(
  persist(
    (set, get) => ({
      photos: [],

      addPhoto: (photoData) => {
        const newPhoto: ProgressPhoto = {
          ...photoData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          photos: [newPhoto, ...state.photos],
        }));
      },

      removePhoto: (id) => {
        set((state) => ({
          photos: state.photos.filter((photo) => photo.id !== id),
        }));
      },

      updatePhoto: (id, updates) => {
        set((state) => ({
          photos: state.photos.map((photo) =>
            photo.id === id ? { ...photo, ...updates } : photo
          ),
        }));
      },

      getPhotosByDate: (date) => {
        return get().photos.filter((photo) => photo.date === date);
      },

      getLatestPhoto: () => {
        const photos = get().photos;
        if (photos.length === 0) return null;
        return photos.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
      },

      clearAllPhotos: () => {
        set({ photos: [] });
      },
    }),
    {
      name: 'progress-photos-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Migration logic for future structure changes
        if (version === 0) {
          return {
            ...persistedState,
            photos: persistedState.photos || [],
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
              console.warn(`[Progress Photos Store] Invalid localStorage structure for ${name}, resetting...`);
              return null;
            }
            return {
              ...parsed,
              state: {
                ...parsed.state,
                photos: parsed.state.photos || [],
              },
            };
          } catch (error) {
            console.error(`[Progress Photos Store] Failed to parse localStorage for ${name}:`, error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error(`[Progress Photos Store] Failed to save to localStorage for ${name}:`, error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error(`[Progress Photos Store] Failed to remove from localStorage for ${name}:`, error);
          }
        },
      },
    }
  )
);

