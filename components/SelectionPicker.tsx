'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useInstancedMeshManager } from './InstancedMeshManager';
import { useSelection } from './SelectionContext';
import { SelectedObject } from './SelectionPanel';

function getGeometryType(geometry: THREE.BufferGeometry): string {
  if (geometry instanceof THREE.BoxGeometry) return 'Box';
  if (geometry instanceof THREE.SphereGeometry) return 'Sphere';
  if (geometry instanceof THREE.CylinderGeometry) return 'Cylinder';
  if (geometry instanceof THREE.ConeGeometry) return 'Cone';
  return 'Unknown';
}

function getMaterialType(material: THREE.Material | THREE.Material[]): string {
  const mat = Array.isArray(material) ? material[0] : material;
  if (mat instanceof THREE.MeshStandardMaterial) return 'MeshStandard';
  if (mat instanceof THREE.MeshPhongMaterial) return 'MeshPhong';
  if (mat instanceof THREE.MeshBasicMaterial) return 'MeshBasic';
  return 'Unknown';
}

function getMaterialColor(
  material: THREE.Material | THREE.Material[],
): string | undefined {
  const mat = Array.isArray(material) ? material[0] : material;
  if (mat && 'color' in mat && mat.color instanceof THREE.Color) {
    return '#' + mat.color.getHexString().toUpperCase();
  }
  return undefined;
}

export function SelectionPicker() {
  const { camera, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const manager = useInstancedMeshManager();
  const { setSelected } = useSelection();

  useEffect(() => {
    if (!manager) {
      console.log('[SelectionPicker] Manager not ready yet');
      return;
    }

    console.log(
      '[SelectionPicker] Manager is ready, registering click listener',
    );

    const handleMouseClick = (event: MouseEvent) => {
      console.log('[SelectionPicker] Click event triggered');

      // Calculate mouse position in normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      console.log('[SelectionPicker] Mouse position:', {
        x: mouseRef.current.x,
        y: mouseRef.current.y,
      });

      // Update the picking ray with the camera and mouse position
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Get all meshes with their configs
      const allMeshes = manager.getAllMeshesWithInstance();
      console.log('[SelectionPicker] Total meshes to check:', allMeshes.length);

      let closestDistance = Infinity;
      let closestObject: SelectedObject | null = null;

      // Check all meshes and their instances for intersections
      for (const { meshId, mesh, config } of allMeshes) {
        console.log(
          `[SelectionPicker] Checking mesh "${meshId}" with ${config.instances.length} instances`,
        );

        // Test ray against each instance's bounding sphere or position
        for (let i = 0; i < config.instances.length; i++) {
          const instanceInfo = manager.getInstanceInfo(meshId, i);
          if (!instanceInfo) {
            console.warn(
              `[SelectionPicker] Could not get instance info for ${meshId}[${i}]`,
            );
            continue;
          }

          const instancePos = new THREE.Vector3(...instanceInfo.position);
          const scale = new THREE.Vector3(...instanceInfo.scale);

          // Compute bounding box if not already done
          if (!mesh.geometry.boundingBox) {
            mesh.geometry.computeBoundingBox();
          }

          const bbox = mesh.geometry.boundingBox;
          if (!bbox) {
            console.warn(
              `[SelectionPicker] No bounding box for ${meshId}[${i}]`,
            );
            continue;
          }

          const bboxSize = bbox.getSize(new THREE.Vector3());
          const scaledSize = bboxSize.clone().multiply(scale);

          // Use the maximum dimension scaled by 1.5 for a generous pick radius
          const radius =
            Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 1.5;

          // Create a sphere at this instance position
          const sphere = new THREE.Sphere(instancePos, radius);

          // Check if ray intersects the sphere
          if (raycasterRef.current.ray.intersectsSphere(sphere)) {
            const distance =
              raycasterRef.current.ray.distanceToPoint(instancePos);

            console.log(
              `[SelectionPicker] ✓ Ray intersects ${meshId}[${i}]: distance=${distance.toFixed(2)}, radius=${radius.toFixed(2)}`,
            );

            if (distance < closestDistance) {
              closestDistance = distance;

              // Convert rotation from radians to degrees
              const rotationDegrees = [
                THREE.MathUtils.radToDeg(instanceInfo.rotation[0]),
                THREE.MathUtils.radToDeg(instanceInfo.rotation[1]),
                THREE.MathUtils.radToDeg(instanceInfo.rotation[2]),
              ] as [number, number, number];

              closestObject = {
                name: mesh.name || meshId,
                position: instanceInfo.position,
                rotation: rotationDegrees,
                scale: instanceInfo.scale,
                geometryType: getGeometryType(mesh.geometry),
                materialType: getMaterialType(mesh.material),
                materialColor: getMaterialColor(mesh.material),
              };

              console.log(
                `[SelectionPicker] New closest: "${closestObject.name}" at distance ${distance.toFixed(2)}`,
              );
            }
          }
        }
      }

      if (closestObject) {
        console.log(
          `[SelectionPicker] ✓ Selected: "${closestObject.name}" at distance ${closestDistance.toFixed(2)}`,
        );
        setSelected(closestObject);
      } else {
        console.log('[SelectionPicker] ✗ Nothing selected');
        setSelected(null);
      }
    };

    gl.domElement.addEventListener('click', handleMouseClick);
    console.log('[SelectionPicker] Click listener registered');

    return () => {
      gl.domElement.removeEventListener('click', handleMouseClick);
      console.log('[SelectionPicker] Click listener unregistered');
    };
  }, [manager, camera, gl, setSelected]);

  return null;
}
