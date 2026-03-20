'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

export interface InstanceData {
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

export interface MeshConfig {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  instances: InstanceData[];
  name?: string;
}

export class InstancedMeshManager {
  private scene: THREE.Scene;
  private instancedMeshes: Map<string, THREE.InstancedMesh> = new Map();
  private count: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  addMesh(id: string, config: MeshConfig): THREE.InstancedMesh {
    const { geometry, material, instances, name } = config;
    const instanceCount = instances.length;

    const mesh = new THREE.InstancedMesh(geometry, material, instanceCount);
    mesh.name = name || id;

    // Set instance transforms
    const matrix = new THREE.Matrix4();
    instances.forEach((instance, index) => {
      const { position, rotation = [0, 0, 0], scale = [1, 1, 1] } = instance;

      matrix.compose(
        new THREE.Vector3(...position),
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(...rotation, 'XYZ'),
        ),
        new THREE.Vector3(...scale),
      );

      mesh.setMatrixAt(index, matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.scene.add(mesh);
    this.instancedMeshes.set(id, mesh);
    this.count += instanceCount;

    return mesh;
  }

  updateInstance(
    meshId: string,
    index: number,
    data: Partial<InstanceData>,
  ): void {
    const mesh = this.instancedMeshes.get(meshId);
    if (!mesh) return;

    const matrix = new THREE.Matrix4();
    mesh.getMatrixAt(index, matrix);
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    matrix.decompose(position, quaternion, scale);

    if (data.position) {
      position.set(...data.position);
    }
    if (data.rotation) {
      quaternion.setFromEuler(new THREE.Euler(...data.rotation, 'XYZ'));
    }
    if (data.scale) {
      scale.set(...data.scale);
    }

    matrix.compose(position, quaternion, scale);
    mesh.setMatrixAt(index, matrix);
    mesh.instanceMatrix.needsUpdate = true;
  }

  getMesh(id: string): THREE.InstancedMesh | undefined {
    return this.instancedMeshes.get(id);
  }

  removeMesh(id: string): void {
    const mesh = this.instancedMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
      this.instancedMeshes.delete(id);
    }
  }

  clear(): void {
    this.instancedMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    this.instancedMeshes.clear();
    this.count = 0;
  }

  getTotalInstances(): number {
    return this.count;
  }

  getAllMeshes(): Map<string, THREE.InstancedMesh> {
    return this.instancedMeshes;
  }
}

export function useInstancedMeshManager() {
  const { scene } = useThree();
  const managerRef = useRef<InstancedMeshManager | null>(null);

  useEffect(() => {
    managerRef.current = new InstancedMeshManager(scene);

    return () => {
      managerRef.current?.clear();
    };
  }, [scene]);

  return managerRef.current;
}
