"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isGuestEmail, normalizeGuestContact } from "./guestContact";

type GuestContactContextValue = {
  guestContact: string | null;
  /** When the guest shared email in this browser tab (ms since epoch). */
  sessionScopedAt: number | null;
  setGuestContact: (contact: string) => void;
  clearGuestContact: () => void;
};

const GuestContactContext = createContext<GuestContactContextValue | null>(null);

type GuestContactProviderProps = {
  children: ReactNode;
};

export function GuestContactProvider({ children }: GuestContactProviderProps) {
  const [guestContact, setGuestContactState] = useState<string | null>(null);
  const [sessionScopedAt, setSessionScopedAt] = useState<number | null>(null);

  const setGuestContact = useCallback((contact: string) => {
    const normalized = normalizeGuestContact(contact);
    if (!isGuestEmail(normalized)) {
      return;
    }
    setGuestContactState(normalized);
    setSessionScopedAt(Date.now());
  }, []);

  const clearGuestContact = useCallback(() => {
    setGuestContactState(null);
    setSessionScopedAt(null);
  }, []);

  const value = useMemo(
    () => ({ guestContact, sessionScopedAt, setGuestContact, clearGuestContact }),
    [guestContact, sessionScopedAt, setGuestContact, clearGuestContact],
  );

  return (
    <GuestContactContext.Provider value={value}>
      {children}
    </GuestContactContext.Provider>
  );
}

export function useGuestContact(): GuestContactContextValue {
  const context = useContext(GuestContactContext);
  if (!context) {
    throw new Error("useGuestContact must be used within GuestContactProvider");
  }
  return context;
}
