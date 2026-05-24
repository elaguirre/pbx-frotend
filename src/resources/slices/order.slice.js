import { orderService } from '@resources/services';

export const createOrderSlice = (set, get) => ({
    currentOrder: null,
    orderLoading: false,

    setCurrentOrder: (order) => set({ currentOrder: order }),

    clearCurrentOrder: () => set({ currentOrder: null }),

    fetchCurrentOrder: async () => {
        set({ orderLoading: true });

        try {
            const order = await orderService.getCurrent();

            set({ currentOrder: order || null });

            return order;
        } catch {
            set({ currentOrder: null });

            return null;
        } finally {
            set({ orderLoading: false });
        }
    },

    startOrder: async (clientId) => {
        const response = await orderService.start(clientId);
        const order = response?.data ?? null;

        set({ currentOrder: order });

        return order;
    },

    checkoutOrder: async () => {
        const orderId = get().currentOrder?.id;

        if (!orderId) {
            return null;
        }

        const response = await orderService.checkout(orderId);

        set({ currentOrder: null });

        return response;
    },
});
