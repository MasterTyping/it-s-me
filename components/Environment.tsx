"use client";

import { useInstancedMeshManager } from "../util/generic/InstancedMeshManager";
import { useEnvironmentLoader } from "../util/loader/EnvironmentLoader";

export default function Environment() {
  const manager = useInstancedMeshManager();
  useEnvironmentLoader(manager);

  return null;
}
