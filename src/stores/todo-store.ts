// src/stores/todo-store.ts
// Zustand store for UI state: the current filter (all / active / completed).
// Client-side state only — nothing here touches the server.

import { create } from 'zustand';

export type Filter = 'all' | 'active' | 'completed';

type TodoStore = {
  filter: Filter;
  setFilter: (filter: Filter) => void;
};

export const useTodoStore = create<TodoStore>((set) => ({
  // Default filter shows everything.
  filter: 'all',

  // Change the current filter.
  setFilter: (filter) => set({ filter }),
}));