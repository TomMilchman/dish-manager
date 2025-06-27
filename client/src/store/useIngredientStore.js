import { create } from "zustand";

const useIngredientStore = create((set) => ({
    ingredients: [],
    selectedIngredients: [], // [{ingredientId: String, amount: Number},...]
    setIngredients: (ingredients) => set({ ingredients }),
    addIngredientRow: () =>
        set((state) => ({
            selectedIngredients: [
                ...state.selectedIngredients,
                { ingredientId: "", amount: 0 },
            ],
        })),
    updateSelectedIngredientAtIndex: (index, updatedRow) =>
        set((state) => {
            const copiedSelectedIngredients = [...state.selectedIngredients];
            copiedSelectedIngredients[index] = updatedRow;
            return { selectedIngredients: copiedSelectedIngredients };
        }),
    removeSelectedIngredientAtIndex: (index) =>
        set((state) => ({
            selectedIngredients: state.selectedIngredients.filter(
                (_, i) => i !== index
            ),
        })),
    clearSelectedIngredients: () => set({ selectedIngredients: [] }),
}));

export default useIngredientStore;
