import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useDishStore = create(
    devtools((set, get) => ({
        // All fetched dishes from the server
        dishesById: {}, // object: { [id]: dish }

        // IDs of selected dishes (for summary view)
        selectedDishIds: [],

        // The dish that is currently being edited in the update form
        dishToEdit: null,

        setDishes: (dishesArray) => {
            const dishesMap = dishesArray.reduce((acc, dish) => {
                acc[dish._id] = dish;
                return acc;
            }, {});
            set({ dishesById: dishesMap });
        },

        getDishById: (dishId) => {
            const { dishesById } = get();
            return dishesById[dishId];
        },

        addDish: (dish) =>
            set((state) => ({
                dishesById: { ...state.dishesById, [dish._id]: dish },
            })),

        updateDish: (updatedDish) =>
            set((state) => ({
                dishesById: {
                    ...state.dishesById,
                    [updatedDish._id]: updatedDish,
                },
            })),

        deleteDishById: (dishId) =>
            set((state) => {
                const { [dishId]: _, ...rest } = state.dishesById;
                return { dishesById: rest };
            }),

        getSelectedDishes: () => {
            const { dishesById, selectedDishIds } = get();
            return selectedDishIds.map((id) => dishesById[id]).filter(Boolean);
        },

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

        // Returns whether dish ID is in selected dishes or not
        isDishIdInSelectedDishIds: (dishId) => {
            const { selectedDishIds } = get();
            return selectedDishIds.includes(dishId);
        },

        // Clear all selections
        clearSelectedDishes: () => set({ selectedDishIds: [] }),

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
