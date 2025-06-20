import { create } from "zustand";

const useDishStore = create((set) => ({
    selectedDishes: [],
    toggleDish: (dishId) =>
        set((state) => {
            const isSelected = state.selectedDishes.includes(dishId);
            return {
                selectedDishes: isSelected
                    ? state.selectedDishes.filter((id) => id !== dishId)
                    : [...state.selectedDishes, dishId],
            };
        }),
}));

export default useDishStore;
