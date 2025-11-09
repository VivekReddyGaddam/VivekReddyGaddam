import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      setCredentials: ({ user, tokens }) =>
        set(() => ({
          user,
          tokens,
          isAuthenticated: Boolean(user && tokens?.accessToken),
        })),
      updateProfile: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : partialUser,
        })),
      logout: () =>
        set(() => ({
          user: null,
          tokens: null,
          isAuthenticated: false,
        })),
      getAccessToken: () => get().tokens?.accessToken ?? null,
    }),
    {
      name: "ideaconnect-auth",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
