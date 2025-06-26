import { create } from "zustand";

const useIngredientStore = create((set) => ({
    ingredients: [],
    setIngredients: (ingredients) => set({ ingredients }),
}));

export default useIngredientStore;
