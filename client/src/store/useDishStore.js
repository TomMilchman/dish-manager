import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useDishStore = create(
    devtools((set, get) => ({
        // All fetched dishes from the server
        dishes: [],

        // IDs of selected dishes (for summary view)
        selectedDishIds: [],

        // The dish that is currently being edited in the update form
        dishToEdit: null,

        // Set the entire dishes list
        setDishes: (dishes) => {
            set({ dishes });
        },

        // Returns the dish object according to ID
        getDishById: (dishId) => {
            const { dishes } = get();
            return dishes.find((dish) => dish._id === dishId);
        },

        // Returns whether dish ID is in selected dishes or not
        isDishIdInSelectedDishIds: (dishId) => {
            const { selectedDishIds } = get();
            return selectedDishIds.includes(dishId);
        },

        // Add a new dish to the list
        addDish: (dish) =>
            set((state) => ({
                dishes: [...(state.dishes || []), dish],
            })),

        // Update an existing dish
        updateDish: (updatedDish) =>
            set((state) => ({
                dishes: state.dishes.map((dish) =>
                    dish._id === updatedDish._id ? updatedDish : dish
                ),
            })),

        // Delete a dish by ID
        deleteDishById: (dishId) =>
            set((state) => ({
                dishes: state.dishes.filter((dish) => dish._id !== dishId),
                selectedDishIds: state.selectedDishIds.filter(
                    (id) => id !== dishId
                ),
            })),

        // Select a dish
        selectDishById: (dishId) =>
            set((state) => ({
                selectedDishIds: [
                    ...new Set([...state.selectedDishIds, dishId]),
                ],
            })),

        // Deselect a dish
        deselectDishById: (dishId) =>
            set((state) => ({
                selectedDishIds: state.selectedDishIds.filter(
                    (id) => id !== dishId
                ),
            })),

        // Toggle dish selection
        toggleDishSelectionById: (dishId) => {
            const { selectedDishIds } = get();
            if (selectedDishIds.includes(dishId)) {
                get().deselectDishById(dishId);
            } else {
                get().selectDishById(dishId);
            }
        },

        // Clear all selections
        clearSelectedDishes: () => set({ selectedDishIds: [] }),

        // Get selected dish objects
        getSelectedDishes: () => {
            const { dishes, selectedDishIds } = get();
            return dishes.filter((dish) => selectedDishIds.includes(dish._id));
        },

        // Set the currently edited dish
        setDishToEdit: (dish) => set({ dishToEdit: dish }),

        // Clears the currently edited dish
        clearDishToEdit: () => set({ dishToEdit: null }),

        clearAllDishFields: () => {
            const { clearSelectedDishes, setDishes } = get();
            setDishes([]);
            clearSelectedDishes();
        },
    }))
);

export default useDishStore;
