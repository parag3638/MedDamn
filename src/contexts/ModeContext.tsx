"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Mode = "immersive" | "light";

interface ModeContextValue {
  mode: Mode;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("immersive");

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === "immersive" ? "light" : "immersive"));
  }, []);

  const setMode = useCallback((newMode: Mode) => {
    setModeState(newMode);
  }, []);

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
