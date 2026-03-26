'use client';

import { useEffect } from 'react';
import { useSelection } from './SelectionContext';
import { SelectionPanel } from './SelectionPanel';

export function SelectionPanelWrapper() {
  const { selectedObject } = useSelection();

  useEffect(() => {
    console.log(
      '[SelectionPanelWrapper] Selected object changed:',
      selectedObject,
    );
  }, [selectedObject]);

  return <SelectionPanel selectedObject={selectedObject} />;
}
