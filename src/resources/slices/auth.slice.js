export const createAuthSlice = (set) => ({
    isLoggedIn: false,
    user: {},

    setMe: (user) => set(() => ({ isLoggedIn: true, user })),
    reset: () => set(() => ({ isLoggedIn: false, user: {} })),
});
