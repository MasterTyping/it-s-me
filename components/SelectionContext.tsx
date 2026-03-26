'use client';

import React, { createContext, useContext, useState } from 'react';
import { SelectedObject } from './SelectionPanel';

export interface SelectionContextType {
  selectedObject: SelectedObject | null;
  setSelected: (obj: SelectedObject | null) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined,
);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedObject, setSelected] = useState<SelectedObject | null>(null);

  return (
    <SelectionContext.Provider
      value={{
        selectedObject,
        setSelected,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return context;
}
