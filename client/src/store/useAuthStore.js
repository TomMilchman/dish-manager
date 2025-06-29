import { create } from "zustand";
import { persist } from "zustand/middleware";
import useDishStore from "./useDishStore";
import useIngredientStore from "./useIngredientStore";

const useAuthStore = create(
    persist(
        (set) => ({
            username: "",
            accessToken: null,
            setUser: (username) => set({ username }),
            setAccessToken: (accessToken) => set({ accessToken }),
            logout: () => {
                set({ user: null, accessToken: null });
                useDishStore.getState().clearAllDishFields();
                useIngredientStore.getState().clearAllIngredientFields();
            },
        }),
        {
            name: "auth-storage",
        }
    )
);

export default useAuthStore;
