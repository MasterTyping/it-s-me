"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, CameraControls } from "@react-three/drei";
import { useRef, useState } from "react";
import { IKSolveResult, ThreeJSURDFModel } from "three-urdf-loader";
import { RobotMesh } from "./RobotModel";
import { RobotInfoPanel } from "./UI/panel/RobotInfoPanel";

const END_EFFECTOR_NAME = "kuka_arm_7_link";

function cloneJointValues(
  values: Record<string, number>,
): Record<string, number> {
  return Object.fromEntries(Object.entries(values));
}

function clamp(value: number, min?: number, max?: number): number {
  let next = value;
  if (typeof min === "number") {
    next = Math.max(next, min);
  }
  if (typeof max === "number") {
    next = Math.min(next, max);
  }
  return next;
}

function buildInitialPose(model: ThreeJSURDFModel): Record<string, number> {
  const result: Record<string, number> = {};

  for (const joint of model.modelInfo.joints) {
    if (
      joint.type !== "revolute" &&
      joint.type !== "prismatic" &&
      joint.type !== "continuous"
    ) {
      continue;
    }

    const lower = joint.limit?.lower;
    const upper = joint.limit?.upper;
    result[joint.name] = clamp(0, lower, upper);
  }

  return result;
}

export default function Scene() {
  const cameraControlsRef = useRef<InstanceType<typeof CameraControls>>(null);
  const [ikDragging, setIkDragging] = useState(false);
  const [robotModel, setRobotModel] = useState<ThreeJSURDFModel | null>(null);
  const [lastIKResult, setLastIKResult] = useState<IKSolveResult | null>(null);
  const [robotError, setRobotError] = useState<string | null>(null);
  const [jointValues, setJointValues] = useState<Record<string, number>>({});
  const [initialJointValues, setInitialJointValues] = useState<
    Record<string, number>
  >({});

  const handleRobotLoad = (model: ThreeJSURDFModel) => {
    setRobotModel(model);

    const loadedJointValues = cloneJointValues(model.getJointValues());
    const hasLoadedValues = Object.keys(loadedJointValues).length > 0;
    const basePose = hasLoadedValues
      ? loadedJointValues
      : buildInitialPose(model);

    model.setJointValues(basePose);
    model.updateMatrixWorld(true);

    setJointValues(cloneJointValues(basePose));
    setInitialJointValues(cloneJointValues(basePose));
  };

  const handleIKSolve = (result: IKSolveResult) => {
    setLastIKResult(result);
    setJointValues((prev) => ({ ...prev, ...result.jointValues }));
  };

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
          onLoadComplete={handleRobotLoad}
          onIKSolve={handleIKSolve}
          onError={setRobotError}
          jointValues={jointValues}
        />

        <gridHelper args={[200, 200]} />
      </Canvas>

      <RobotInfoPanel
        model={robotModel}
        isIKDragging={ikDragging}
        lastIKResult={lastIKResult}
        errorMessage={robotError}
        endEffectorName={END_EFFECTOR_NAME}
        jointValues={jointValues}
        onJointValueChange={(name, value) => {
          setJointValues((prev) => ({ ...prev, [name]: value }));
        }}
        onResetPose={() => {
          const resetValues = cloneJointValues(initialJointValues);
          setJointValues(resetValues);
          setLastIKResult(null);

          if (robotModel) {
            robotModel.setJointValues(resetValues);
            robotModel.updateMatrixWorld(true);
          }
        }}
      />
    </div>
  );
}
