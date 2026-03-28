import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import {
  IKSolveResult,
  ThreeJSURDFModel,
  URDFIKControls,
  URDFModel,
  URDFModelRef,
} from "three-urdf-loader";

const ROBOT_CONFIG = {
  urdfUrl: "/data/kuka_lwr/kuka.urdf",
  baseLinkName: "calib_kuka_arm_base_link",
  endEffectorName: "kuka_arm_7_link",
  chainRootName: "calib_kuka_arm_base_link",
  pivotScale: 0.3,
  ikSolverOptions: {
    maxIterations: 30,
    tolerance: 0.001,
    dampingFactor: 1.0,
  },
  initialRotation: {
    axis: new THREE.Vector3(1, 0, 0),
    angle: -Math.PI / 2,
  },
};

interface RobotMeshProps {
  onIKSolve?: (result: IKSolveResult) => void;
  onLoadComplete?: (model: ThreeJSURDFModel) => void;
  onError?: (error: string) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  jointValues?: Record<string, number>;
}

export function RobotMesh({
  onIKSolve,
  onLoadComplete,
  onError,
  onDragStateChange,
  jointValues,
}: RobotMeshProps) {
  const modelRef = useRef<URDFModelRef>(null);

  const [robotModel, setRobotModel] = useState<ThreeJSURDFModel | null>(null);

  const handleLoad = useCallback(
    (loadedModel: ThreeJSURDFModel) => {
      const { axis, angle } = ROBOT_CONFIG.initialRotation;
      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(axis, angle);

      loadedModel.quaternion.multiplyQuaternions(
        quaternion,
        loadedModel.quaternion,
      );
      loadedModel.updateMatrixWorld(true);

      setRobotModel(loadedModel);
      onLoadComplete?.(loadedModel);
    },
    [onLoadComplete],
  );

  const handleSolve = useCallback(
    (result: IKSolveResult) => {
      const status = result.success
        ? "✓ Success"
        : `✗ Failed (error: ${result.error.toFixed(4)})`;

      onIKSolve?.(result);
    },
    [onIKSolve],
  );

  const handleDragStart = useCallback(() => {
    onDragStateChange?.(true);
  }, [onDragStateChange]);

  const handleDragEnd = useCallback(() => {
    onDragStateChange?.(false);
  }, [onDragStateChange]);

  return (
    <>
      <URDFModel
        ref={modelRef}
        url={ROBOT_CONFIG.urdfUrl}
        jointValues={jointValues}
        onLoad={handleLoad}
      />

      {robotModel && (
        <URDFIKControls
          model={robotModel}
          endEffectorName={ROBOT_CONFIG.endEffectorName}
          chainRootName={ROBOT_CONFIG.chainRootName}
          pivotScale={ROBOT_CONFIG.pivotScale}
          visible={true}
          solverOptions={ROBOT_CONFIG.ikSolverOptions}
          onSolve={handleSolve}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          followEndEffectorWhileDragging={true}
          solveOrientation={false}
          dragResponse={0.1}
        />
      )}
    </>
  );
}
