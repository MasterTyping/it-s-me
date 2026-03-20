'use client';

import { useInstancedMeshManager } from './InstancedMeshManager';
import { useEnvironmentLoader } from './EnvironmentLoader';

export default function Environment() {
  const manager = useInstancedMeshManager();
  useEnvironmentLoader(manager);

  return null;
}
