import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createAuthSlice, createOrderSlice } from './slices';

export const useAppStore = create(
    devtools((...args) => ({
        ...createAuthSlice(...args),
        ...createOrderSlice(...args),
    }))
);
