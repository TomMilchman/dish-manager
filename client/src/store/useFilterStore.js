// store/useFilterStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useFilterStore = create(
    devtools((set, get) => ({
        tags: [],
        selectedTags: new Set(),
        searchQuery: "",
        showFavoritesOnly: false,
        showUserOnly: false,

        setSearchQuery: (query) => set({ searchQuery: query }),

        setTags: (tags) => set({ tags }),

        toggleSelectedTag: (tag) =>
            set((state) => {
                const newSet = new Set(state.selectedTags);
                if (newSet.has(tag)) {
                    newSet.delete(tag);
                } else {
                    newSet.add(tag);
                }
                return { selectedTags: newSet };
            }),

        clearSelectedTags: () => set({ selectedTags: new Set() }),

        clearSearchQuery: () => set({ searchQuery: "" }),

        setShowFavoritesOnly: (value) => set({ showFavoritesOnly: value }),

        setShowUserOnly: (value) => set({ showUserOnly: value }),

        clearSelectedFilters: () => {
            const {
                clearSelectedTags,
                clearSearchQuery,
                setShowFavoritesOnly,
                setShowUserOnly,
            } = get();

            clearSelectedTags();
            clearSearchQuery("");
            setShowFavoritesOnly(false);
            setShowUserOnly(false);
        },

        clearAllFilterFields: () => {
            const { setTags, clearSelectedFilters } = get();

            clearSelectedFilters();
            setTags([]);
        },
    }))
);

export default useFilterStore;
