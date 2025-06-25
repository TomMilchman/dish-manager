import { create } from "zustand";

const useDishStore = create((set, get) => ({
    // All fetched dishes from the server
    dishes: [],

    // IDs of selected dishes (for summary view)
    selectedDishIds: [],

    // Set the entire dishes list
    setDishes: (dishes) => set({ dishes }),

    // Add a new dish to the list
    addDish: (dish) => set((state) => ({ dishes: [...state.dishes, dish] })),

    // Update an existing dish
    updateDish: (updatedDish) =>
        set((state) => ({
            dishes: state.dishes.map((dish) =>
                dish._id === updatedDish._id ? updatedDish : dish
            ),
        })),

    // Delete a dish by ID
    deleteDish: (dishId) =>
        set((state) => ({
            dishes: state.dishes.filter((dish) => dish._id !== dishId),
            selectedDishIds: state.selectedDishIds.filter(
                (id) => id !== dishId
            ),
        })),

    // Select a dish
    selectDish: (dishId) =>
        set((state) => ({
            selectedDishIds: [...new Set([...state.selectedDishIds, dishId])],
        })),

    // Deselect a dish
    deselectDish: (dishId) =>
        set((state) => ({
            selectedDishIds: state.selectedDishIds.filter(
                (id) => id !== dishId
            ),
        })),

    // Toggle dish selection
    toggleDishSelection: (dishId) => {
        const { selectedDishIds } = get();
        if (selectedDishIds.includes(dishId)) {
            get().deselectDish(dishId);
        } else {
            get().selectDish(dishId);
        }
    },

    // Clear all selections
    clearSelectedDishes: () => set({ selectedDishIds: [] }),

    // Get selected dish objects
    getSelectedDishes: () => {
        const { dishes, selectedDishIds } = get();
        return dishes.filter((dish) => selectedDishIds.includes(dish._id));
    },
}));

export default useDishStore;
