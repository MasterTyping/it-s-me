'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Environment from './Environment';

export default function Scene() {
  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[15, 10, 15]} />
      <OrbitControls />

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
