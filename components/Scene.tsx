'use client';

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import Environment from './Environment';
import { PlayerController } from './PlayerController';

export default function Scene() {
  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[15, 2, 15]} />
      <PlayerController />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Environment />
      <gridHelper args={[20, 20]} />
    </Canvas>
  );
}
