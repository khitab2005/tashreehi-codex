"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Locale } from "./content";
export interface Preferences {
  locale: Locale;
  theme: "light" | "dark";
  favorites: string[];
  completed: string[];
  lastLesson: string | null;
  quizBest: number;
  lowPower: boolean;
  storageWarning: boolean;
  setLocale: (v: Locale) => void;
  toggleTheme: () => void;
  toggleFavorite: (id: string) => void;
  visit: (id: string) => void;
  complete: (id: string) => void;
  recordQuiz: (score: number) => void;
  setLowPower: (v: boolean) => void;
  clear: () => void;
}
const defaults = {
  locale: "ar" as Locale,
  theme: "light" as const,
  favorites: [] as string[],
  completed: [] as string[],
  lastLesson: null as string | null,
  quizBest: 0,
  lowPower: false,
  storageWarning: false,
};
const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      queueMicrotask(() => {
        if (!usePreferences.getState().storageWarning)
          usePreferences.setState({ storageWarning: true });
      });
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};
export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      ...defaults,
      setLocale: (locale) => set({ locale }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),
      visit: (lastLesson) => set({ lastLesson }),
      complete: (id) =>
        set((s) => ({
          completed: s.completed.includes(id)
            ? s.completed
            : [...s.completed, id],
        })),
      recordQuiz: (score) =>
        set((s) => ({ quizBest: Math.max(s.quizBest, score) })),
      setLowPower: (lowPower) => set({ lowPower }),
      clear: () => set(defaults),
    }),
    {
      name: "tashreehi-preferences-v1",
      storage: createJSONStorage(() => safeStorage),
      version: 1,
      skipHydration: true,
      partialize: (s) => ({
        locale: s.locale,
        theme: s.theme,
        favorites: s.favorites,
        completed: s.completed,
        lastLesson: s.lastLesson,
        quizBest: s.quizBest,
        lowPower: s.lowPower,
      }),
    },
  ),
);
