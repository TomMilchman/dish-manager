import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useMetaStore = create(
    devtools((set) => ({
        colorMap: {},
        setColorMap: (colorMap) => set({ colorMap }),
    }))
);

export default useMetaStore;
