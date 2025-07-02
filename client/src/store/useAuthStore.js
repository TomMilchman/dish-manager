import { create } from "zustand";
import { persist } from "zustand/middleware";
import useDishStore from "./useDishStore";
import useIngredientStore from "./useIngredientStore";
import { queryClient } from "../api/queryClient";

const useAuthStore = create(
    persist(
        (set) => ({
            username: "",
            role: "",
            accessToken: null,
            setUsername: (username) => set({ username }),
            setRole: (role) => set({ role }),
            setAccessToken: (accessToken) => set({ accessToken }),
            logout: () => {
                set({ user: null, accessToken: null });
                useDishStore.getState().clearAllDishFields();
                useIngredientStore.getState().clearAllIngredientFields();
                queryClient.clear();
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                accessToken: state.accessToken,
            }),
        }
    )
);

export default useAuthStore;
