'use client';

import { Canvas } from '@react-three/fiber';
import {
  PerspectiveCamera,
  OrbitControls,
  CameraControls,
} from '@react-three/drei';
import { RobotMesh } from './RobotModel';

export default function Scene() {
  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[1, 1, 1]} />
      <CameraControls />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
      />
      <RobotMesh></RobotMesh>
      <gridHelper args={[200, 200]} />
    </Canvas>
  );
}
