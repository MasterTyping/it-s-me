"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, CameraControls } from "@react-three/drei";
import { useRef, useState } from "react";
import { IKSolveResult, ThreeJSURDFModel } from "three-urdf-loader";
import { RobotMesh } from "./RobotModel";
import { RobotInfoPanel } from "./UI/panel/RobotInfoPanel";

const END_EFFECTOR_NAME = "kuka_arm_7_link";

export default function Scene() {
  const cameraControlsRef = useRef<InstanceType<typeof CameraControls>>(null);
  const [ikDragging, setIkDragging] = useState(false);
  const [robotModel, setRobotModel] = useState<ThreeJSURDFModel | null>(null);
  const [lastIKResult, setLastIKResult] = useState<IKSolveResult | null>(null);
  const [robotError, setRobotError] = useState<string | null>(null);

  const handleIKDragStateChange = (isDragging: boolean) => {
    setIkDragging(isDragging);
    if (cameraControlsRef.current) {
      cameraControlsRef.current.enabled = !isDragging;
    }
  };

  return (
    <div className="relative h-full w-full">
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
        <RobotMesh
          onDragStateChange={handleIKDragStateChange}
          onLoadComplete={setRobotModel}
          onIKSolve={setLastIKResult}
          onError={setRobotError}
        />

        <gridHelper args={[200, 200]} />
      </Canvas>

      <RobotInfoPanel
        model={robotModel}
        isIKDragging={ikDragging}
        lastIKResult={lastIKResult}
        errorMessage={robotError}
        endEffectorName={END_EFFECTOR_NAME}
      />
    </div>
  );
}
