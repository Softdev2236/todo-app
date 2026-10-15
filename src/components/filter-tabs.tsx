// src/components/filter-tabs.tsx
// The filter pills: All / Active / Completed.
// Reads and writes the filter in the Zustand store.

'use client';

import { useTodoStore } from '@/stores/todo-store';
import type { Filter } from '@/stores/todo-store';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export function FilterTabs() {
  // Read the current filter and the setter from Zustand.
  const filter = useTodoStore((state) => state.filter);
  const setFilter = useTodoStore((state) => state.setFilter);

  return (
    <div className="flex items-center gap-1 p-1 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-sm shadow-black/5 w-fit">
      {FILTERS.map((item) => {
        const isActive = filter === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`
              relative
              px-4 py-2
              text-sm font-medium
              rounded-xl
              transition-all duration-200
              ${
                isActive
                  ? 'bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }
            `}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}