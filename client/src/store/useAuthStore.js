import { create } from "zustand";
import { persist } from "zustand/middleware";

import useDishStore from "./useDishStore";
import useIngredientStore from "./useIngredientStore";
import useFilterStore from "./useFilterStore";

import { queryClient } from "../api/queryClient";
import { getUserCredentialsFromAccessToken } from "../utils/tokenDecoder";

const useAuthStore = create(
    persist(
        (set) => ({
            username: null,
            role: null,
            accessToken: null,
            setAuth: () => {
                try {
                    const { username, role } =
                        getUserCredentialsFromAccessToken(); // reads from localStorage
                    set({ username, role });
                } catch {
                    set({
                        username: null,
                        role: null,
                    });
                }
            },
            setAccessToken: (accessToken) => set({ accessToken }),
            logout: () => {
                set({ user: null, accessToken: null });
                useDishStore.getState().clearAllDishFields();
                useIngredientStore.getState().clearAllIngredientFields();
                useFilterStore.getState().clearAllFilterFields();
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
