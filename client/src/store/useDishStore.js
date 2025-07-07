import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useDishStore = create(
    devtools((set, get) => ({
        // All fetched dishes from the server
        dishesById: {}, // object: { [id]: dish }

        // IDs of selected dishes (for summary view)
        selectedDishIds: new Set(),

        // The dish that is currently being edited in the update form
        dishToEdit: null,

        setDishes: (dishesArray) => {
            const dishesMap = (dishesArray || []).reduce((acc, dish) => {
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
            return Array.from(selectedDishIds)
                .map((id) => dishesById[id])
                .filter(Boolean);
        },

        // Select a dish
        selectDishById: (dishId) =>
            set((state) => ({
                selectedDishIds: new Set(state.selectedDishIds).add(dishId),
            })),

        // Deselect a dish
        deselectDishById: (dishId) =>
            set((state) => {
                const newSet = new Set(state.selectedDishIds);
                newSet.delete(dishId);
                return { selectedDishIds: newSet };
            }),

        // Toggle dish selection
        toggleDishSelectionById: (dishId) =>
            set((state) => {
                const newSet = new Set(state.selectedDishIds);

                if (newSet.has(dishId)) {
                    newSet.delete(dishId);
                } else {
                    newSet.add(dishId);
                }
                return { selectedDishIds: newSet };
            }),

        setSelectedDishIds: (ids) => set({ selectedDishIds: new Set(ids) }),

        // Returns whether dish ID is in selected dishes or not
        isDishIdInSelectedDishIds: (dishId) => {
            const { selectedDishIds } = get();
            return selectedDishIds.has(dishId);
        },

        // Clear all selections
        clearSelectedDishes: () => set({ selectedDishIds: new Set() }),

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
