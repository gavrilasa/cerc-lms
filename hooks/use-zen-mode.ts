import { create } from "zustand";

interface ZenModeStore {
	isZenMode: boolean;
	toggleZenMode: () => void;
}

export const useZenModeStore = create<ZenModeStore>((set) => ({
	isZenMode: false,
	toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
}));
