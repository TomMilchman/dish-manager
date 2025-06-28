import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useModalStore = create(
    devtools((set) => ({
        isOpen: false,
        content: null,
        openModal: (content) => set({ isOpen: true, content }),
        closeModal: () => set({ isOpen: false, content: null }),
    }))
);

export default useModalStore;
