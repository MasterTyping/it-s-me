'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import {
  InstancedMeshManager,
  InstanceData,
  MeshConfig,
} from './InstancedMeshManager';

export interface EnvironmentObject {
  id: string;
  geometry: 'box' | 'sphere' | 'cylinder' | 'cone';
  material: 'standard' | 'phong' | 'basic';
  color: string;
  instances: InstanceData[];
  geometryArgs?: Record<string, number>;
}

export interface EnvironmentConfig {
  objects: EnvironmentObject[];
}

export class EnvironmentLoader {
  private manager: InstancedMeshManager;

  constructor(manager: InstancedMeshManager) {
    this.manager = manager;
  }

  private createGeometry(
    type: string,
    args?: Record<string, number>,
  ): THREE.BufferGeometry {
    const defaultArgs = {
      box: { width: 1, height: 1, depth: 1 },
      sphere: { radius: 0.5, widthSegments: 32, heightSegments: 32 },
      cylinder: {
        radiusTop: 0.5,
        radiusBottom: 0.5,
        height: 1,
        radialSegments: 32,
      },
      cone: { radius: 0.5, height: 1, radialSegments: 32 },
    };

    const finalArgs = {
      ...defaultArgs[type as keyof typeof defaultArgs],
      ...args,
    };

    switch (type) {
      case 'box':
        return new THREE.BoxGeometry(
          finalArgs.width,
          finalArgs.height,
          finalArgs.depth,
        );
      case 'sphere':
        return new THREE.SphereGeometry(
          finalArgs.radius,
          finalArgs.widthSegments,
          finalArgs.heightSegments,
        );
      case 'cylinder':
        return new THREE.CylinderGeometry(
          finalArgs.radiusTop,
          finalArgs.radiusBottom,
          finalArgs.height,
          finalArgs.radialSegments,
        );
      case 'cone':
        return new THREE.ConeGeometry(
          finalArgs.radius,
          finalArgs.height,
          finalArgs.radialSegments,
        );
      default:
        return new THREE.BoxGeometry();
    }
  }

  private createMaterial(type: string, color: string): THREE.Material {
    const colorInt = new THREE.Color(color);

    switch (type) {
      case 'standard':
        return new THREE.MeshStandardMaterial({
          color: colorInt,
          metalness: 0.3,
          roughness: 0.7,
        });
      case 'phong':
        return new THREE.MeshPhongMaterial({ color: colorInt });
      case 'basic':
        return new THREE.MeshBasicMaterial({ color: colorInt });
      default:
        return new THREE.MeshStandardMaterial({ color: colorInt });
    }
  }

  loadEnvironment(config: EnvironmentConfig): void {
    config.objects.forEach((obj) => {
      const geometry = this.createGeometry(obj.geometry, obj.geometryArgs);
      const material = this.createMaterial(obj.material, obj.color);

      const meshConfig: MeshConfig = {
        geometry,
        material,
        instances: obj.instances,
        name: obj.id,
      };

      this.manager.addMesh(obj.id, meshConfig);
    });
  }

  loadEnvironmentFromJSON(json: EnvironmentConfig): void {
    this.loadEnvironment(json);
  }

  clear(): void {
    this.manager.clear();
  }
}

export function useEnvironmentLoader(manager: InstancedMeshManager | null) {
  useEffect(() => {
    if (!manager) return;

    // Example environment setup
    const exampleEnvironment: EnvironmentConfig = {
      objects: [
        {
          id: 'ground',
          geometry: 'box',
          material: 'standard',
          color: '#666666',
          geometryArgs: { width: 20, height: 0.5, depth: 20 },
          instances: [{ position: [0, -0.5, 0] }],
        },
        {
          id: 'pillars',
          geometry: 'cylinder',
          material: 'standard',
          color: '#8B7355',
          geometryArgs: {
            radiusTop: 0.3,
            radiusBottom: 0.3,
            height: 3,
            radialSegments: 16,
          },
          instances: [
            { position: [-5, 1.5, -5] },
            { position: [5, 1.5, -5] },
            { position: [-5, 1.5, 5] },
            { position: [5, 1.5, 5] },
          ],
        },
        {
          id: 'decorative-spheres',
          geometry: 'sphere',
          material: 'standard',
          color: '#FF6B6B',
          geometryArgs: { radius: 0.4 },
          instances: [
            { position: [-3, 3.5, 0], scale: [1, 1, 1] },
            { position: [3, 3.5, 0], scale: [1, 1, 1] },
            { position: [0, 3.5, -3], scale: [1, 1, 1] },
            { position: [0, 3.5, 3], scale: [1, 1, 1] },
          ],
        },
      ],
    };

    const loader = new EnvironmentLoader(manager);
    loader.loadEnvironment(exampleEnvironment);

    return () => {
      loader.clear();
    };
  }, [manager]);
}
