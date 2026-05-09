// src/atoms/sidebarAtom.ts
import { atom } from "jotai";

export const sidebarOpenAtom = atom<boolean>(true); // default: open

// Derived atom (optional, to toggle easily)
export const toggleSidebarAtom = atom(
  null,
  (get, set) => set(sidebarOpenAtom, !get(sidebarOpenAtom))
);
