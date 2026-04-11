import { create } from "zustand";

export type SheetType =
    | "new-account"
    | "edit-account"
    | "new-category"
    | "edit-category"
    | "new-transaction"
    | "edit-transaction"
    | "new-goal"
    | "edit-goal"
    | "new-recurring"
    | "edit-recurring"
    | "new-budget"
    | "edit-budget"
    | "new-investment"
    | "edit-investment";

type SheetStore = {
    isOpen: boolean;
    type: SheetType | null;
    data: any;
    onOpen: (type: SheetType, data?: any) => void;
    onClose: () => void;
};

export const useSheet = create<SheetStore>((set) => ({
    isOpen: false,
    type: null,
    data: {},
    onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
    onClose: () => set({ isOpen: false, type: null, data: {} }),
}));
