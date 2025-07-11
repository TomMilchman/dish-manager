import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useIngredientStore = create(
    devtools((set, get) => ({
        ingredientsById: {}, // Map of ingredientId to ingredient object
        selectedIngredients: [{ ingredientId: "", amount: 0 }], // [{ingredientId: String, amount: Number},...]
        setIngredients: (ingredients) => {
            const ingredientsById = ingredients.reduce((acc, ingredient) => {
                acc[ingredient._id] = ingredient;
                return acc;
            }, {});
            set({ ingredientsById });
        },
        addOrUpdateIngredient: (ingredient) =>
            set((state) => ({
                ingredientsById: {
                    ...state.ingredientsById,
                    [ingredient._id]: ingredient,
                },
            })),
        addIngredientRow: () =>
            set((state) => ({
                selectedIngredients: [
                    ...state.selectedIngredients,
                    { ingredientId: "", amount: 0 },
                ],
            })),
        getIngredientById: (ingredientId) => {
            const state = get();
            return state.ingredientsById[ingredientId];
        },
        updateSelectedIngredientAtIndex: (index, updatedRow) =>
            set((state) => {
                const copiedSelectedIngredients = [
                    ...state.selectedIngredients,
                ];
                copiedSelectedIngredients[index] = updatedRow;
                return { selectedIngredients: copiedSelectedIngredients };
            }),
        removeSelectedIngredientAtIndex: (index) =>
            set((state) => {
                const updated = state.selectedIngredients.filter(
                    (_, i) => i !== index
                );
                return {
                    selectedIngredients:
                        updated.length > 0
                            ? updated
                            : [{ ingredientId: "", amount: 0 }],
                };
            }),
        setSelectedIngredients: (ingredients) =>
            set({ selectedIngredients: ingredients }),
        clearSelectedIngredients: () =>
            set({ selectedIngredients: [{ ingredientId: "", amount: 0 }] }),
        clearAllIngredientFields: () => {
            const { setIngredients, clearSelectedIngredients } = get();
            setIngredients([]);
            clearSelectedIngredients();
        },
    }))
);

export default useIngredientStore;
