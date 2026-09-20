"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PresenceContextValue = {
  report: (id: string, visible: boolean) => void;
  hasCards: boolean;
};

const PresenceContext = createContext<PresenceContextValue | null>(null);

export function StatusCardPresenceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({});

  const report = useCallback((id: string, visible: boolean) => {
    setVisibleIds((current) => {
      if (Boolean(current[id]) === visible) {
        return current;
      }
      return { ...current, [id]: visible };
    });
  }, []);

  const hasCards = Object.values(visibleIds).some(Boolean);
  const value = useMemo(() => ({ report, hasCards }), [report, hasCards]);

  return (
    <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
  );
}

export function useStatusCardPresence(id: string, visible: boolean) {
  const context = useContext(PresenceContext);
  useEffect(() => {
    if (!context) {
      return;
    }
    context.report(id, visible);
    return () => context.report(id, false);
  }, [context, id, visible]);
}

export function useHasStatusCards(): boolean {
  return useContext(PresenceContext)?.hasCards ?? false;
}
