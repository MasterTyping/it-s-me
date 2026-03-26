'use client';

import { useEffect, useRef, SetStateAction } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useKeyboardController, KeyState } from './KeyboardController';

export interface PlayerConfig {
  speed?: number;
  jumpForce?: number;
  gravity?: number;
  moveSpeed?: number;
  rotationSpeed?: number;
}

const DEFAULT_CONFIG: PlayerConfig = {
  speed: 0.2,
  jumpForce: 0.5,
  gravity: 0.02,
  moveSpeed: 0.15,
  rotationSpeed: 0.1,
};

export function PlayerController({
  config = DEFAULT_CONFIG,
}: {
  config?: PlayerConfig;
}) {
  const { camera } = useThree();
  const keyStateRef = useKeyboardController();

  const playerStateRef = useRef({
    position: new THREE.Vector3().copy(camera.position),
    velocity: new THREE.Vector3(0, 0, 0),
    isJumping: false,
    isGrounded: false,
    groundLevel: 1, // Camera height above ground
    yaw: 0,
    pitch: 0,
  });

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Set initial camera position
  useEffect(() => {
    camera.position.set(15, 2, 15);
    playerStateRef.current.position.copy(camera.position);
    playerStateRef.current.groundLevel = camera.position.y;
  }, [camera]);

  useFrame(() => {
    const state = playerStateRef.current;
    const keys = keyStateRef.current;

    // Movement direction
    const moveDir = new THREE.Vector3(0, 0, 0);

    if (keys.w) moveDir.z -= 1;
    if (keys.s) moveDir.z += 1;
    if (keys.a) moveDir.x -= 1;
    if (keys.d) moveDir.x += 1;

    // Normalize movement direction
    if (moveDir.length() > 0) {
      moveDir.normalize();
    }

    // Get camera direction (yaw only, not pitch)
    const yawQuat = new THREE.Quaternion();
    yawQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);
    moveDir.applyQuaternion(yawQuat);

    // Apply movement
    state.position.add(moveDir.multiplyScalar(finalConfig.moveSpeed!));

    // Handle jumping
    if (keys.space && state.isGrounded) {
      state.velocity.y = finalConfig.jumpForce!;
      state.isGrounded = false;
    }

    // Apply gravity
    state.velocity.y -= finalConfig.gravity!;

    // Update vertical position
    state.position.y += state.velocity.y;

    // Ground collision
    if (state.position.y <= state.groundLevel) {
      state.position.y = state.groundLevel;
      state.velocity.y = 0;
      state.isGrounded = true;
    }

    // mouse look (using arrow keys as fallback for now)
    // You can integrate with mouse later
    const lookSensitivity = 0.02;

    // Update camera position with lerp for smoothness
    camera.position.lerp(state.position, 0.1);

    // Update camera direction (look ahead where player is moving)
    const lookTarget = new THREE.Vector3();
    lookTarget.copy(state.position);
    lookTarget.add(new THREE.Vector3(0, 0.5, 0));

    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(yawQuat);
    forward.normalize();
    lookTarget.add(forward.multiplyScalar(3));

    camera.lookAt(lookTarget);
  });

  return null;
}

export function usePlayerController(config?: PlayerConfig) {
  return <PlayerController config={config} />;
}
