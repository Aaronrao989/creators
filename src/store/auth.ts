"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Mock client-side auth for the demo build. Accounts and per-user shortlists are
 * persisted to localStorage — there is no real backend yet. When the WordPress /
 * custom API is wired in, swap these methods for real auth + a saved-properties
 * endpoint; the component contract stays the same.
 *
 * NOTE: passwords are stored in localStorage in plain text for the demo only.
 * Do not use this pattern in production.
 */
export interface User {
  name: string;
  email: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthState {
  user: User | null;
  users: Record<string, StoredUser>;
  /** property ids saved per user email */
  shortlists: Record<string, string[]>;
  error: string | null;
  signup: (name: string, email: string, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  /** Simulated Google sign-in for the demo (no real OAuth yet). */
  googleSignin: () => boolean;
  logout: () => void;
  toggleShortlist: (propertyId: string) => boolean;
  setError: (e: string | null) => void;
}

const norm = (e: string) => e.trim().toLowerCase();

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: {},
      shortlists: {},
      error: null,

      signup: (name, email, password) => {
        const mail = norm(email);
        if (!name.trim() || !mail || !password) {
          set({ error: "Please fill in every field." });
          return false;
        }
        if (password.length < 4) {
          set({ error: "Password must be at least 4 characters." });
          return false;
        }
        if (get().users[mail]) {
          set({ error: "An account with this email already exists." });
          return false;
        }
        set((s) => ({
          users: { ...s.users, [mail]: { name: name.trim(), email: mail, password } },
          user: { name: name.trim(), email: mail },
          error: null,
        }));
        return true;
      },

      login: (email, password) => {
        const mail = norm(email);
        const u = get().users[mail];
        if (!u || u.password !== password) {
          set({ error: "Invalid email or password." });
          return false;
        }
        set({ user: { name: u.name, email: mail }, error: null });
        return true;
      },

      googleSignin: () => {
        // Demo only: a real integration would open Google OAuth and use the
        // returned profile. Here we sign in a consistent mock Google identity.
        const email = "demo.google@gmail.com";
        const name = "Demo Google User";
        set((s) => ({
          users: s.users[email]
            ? s.users
            : { ...s.users, [email]: { name, email, password: "__google__" } },
          user: { name, email },
          error: null,
        }));
        return true;
      },

      logout: () => set({ user: null }),

      toggleShortlist: (propertyId) => {
        const { user, shortlists } = get();
        if (!user) return false;
        const cur = shortlists[user.email] ?? [];
        const next = cur.includes(propertyId)
          ? cur.filter((x) => x !== propertyId)
          : [...cur, propertyId];
        set({ shortlists: { ...shortlists, [user.email]: next } });
        return true;
      },

      setError: (e) => set({ error: e }),
    }),
    { name: "creators-auth" },
  ),
);

/* ---- selector helpers (reactive slices) --------------------------------- */
export const selectShortlistIds = (s: AuthState) =>
  s.user ? s.shortlists[s.user.email] ?? [] : [];
