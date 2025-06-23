import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
    persist((set) => ({
        username: "",
        accessToken: null,
        setUser: (username) => set({ username }),
        setAccessToken: (accessToken) => set({ accessToken }),
        logout: () =>
            set({ user: null, accessToken: null, isAuthenticated: false }),
    }))
);

export default useAuthStore;
