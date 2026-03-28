"use client";

import { Canvas } from "@react-three/fiber";
import {
  PerspectiveCamera,
  OrbitControls,
  CameraControls,
} from "@react-three/drei";
import { useRef, useState } from "react";
import { RobotMesh } from "./RobotModel";

export default function Scene() {
  const cameraControlsRef = useRef<InstanceType<typeof CameraControls>>(null);
  const [ikDragging, setIkDragging] = useState(false);

  const handleIKDragStateChange = (isDragging: boolean) => {
    setIkDragging(isDragging);
    if (cameraControlsRef.current) {
      cameraControlsRef.current.enabled = !isDragging;
    }
  };

  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[1, 1, 1]} />
      <CameraControls ref={cameraControlsRef} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
      />
      <RobotMesh onDragStateChange={handleIKDragStateChange} />

      <gridHelper args={[200, 200]} />
    </Canvas>
  );
}
