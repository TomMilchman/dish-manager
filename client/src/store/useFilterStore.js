// store/useFilterStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useFilterStore = create(
    devtools((set, get) => ({
        tags: [],
        selectedTags: [],
        searchQuery: "",
        showFavoritesOnly: false,

        setSearchQuery: (query) => {
            set({ searchQuery: query });
        },
        setTags: (tags) => set({ tags }),
        toggleSelectedTag: (tag) => {
            set((state) => ({
                selectedTags: state.selectedTags.includes(tag)
                    ? state.selectedTags.filter((t) => t !== tag)
                    : [...state.selectedTags, tag],
            }));
        },
        clearSelectedTags: () => set({ selectedTags: [] }),
        setShowFavoritesOnly: (value) => {
            set({ showFavoritesOnly: value });
        },
        clearAllFilterFields: () => {
            const {
                clearSelectedTags,
                setTags,
                setSearchQuery,
                setShowFavoritesOnly,
            } = get();

            clearSelectedTags();
            setTags([]);
            setSearchQuery("");
            setShowFavoritesOnly(false);
        },
    }))
);

export default useFilterStore;
