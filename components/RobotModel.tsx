import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import {
  IKSolveResult,
  ThreeJSURDFModel,
  URDFIKControls,
  URDFModel,
  URDFModelRef,
} from "three-urdf-loader";

/** KUKA LWR 로봇 설정 */
const ROBOT_CONFIG = {
  urdfUrl: "/data/kuka_lwr/kuka.urdf",
  baseLinkName: "calib_kuka_arm_base_link",
  endEffectorName: "kuka_arm_7_link", // 실제 끝 이펙터 링크
  chainRootName: "calib_kuka_arm_base_link", // 역기구학 체인의 루트
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
  /** IK 솔버 결과 콜백 */
  onIKSolve?: (result: IKSolveResult) => void;
  /** 로드 완료 콜백 */
  onLoadComplete?: (model: ThreeJSURDFModel) => void;
  /** 에러 콜백 */
  onError?: (error: string) => void;
  /** 드래그 상태 변경 콜백 (카메라 컨트롤 제어용) */
  onDragStateChange?: (isDragging: boolean) => void;
  /** 외부 UI(슬라이더)에서 제어하는 joint 값 */
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

  /**
   * 로봇 모델 로드 핸들러
   * - 초기 회전 적용
   * - 상태 업데이트
   */
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

      console.log(
        `[RobotMesh] Robot model loaded: ${ROBOT_CONFIG.urdfUrl}`,
        loadedModel,
      );
      console.log(
        `[RobotMesh] End-effector link: ${ROBOT_CONFIG.endEffectorName}`,
      );
      console.log(`[RobotMesh] Chain root: ${ROBOT_CONFIG.chainRootName}`);

      onLoadComplete?.(loadedModel);
    },
    [onLoadComplete],
  );

  /**
   * IK 솔버 결과 핸들러
   * - 성공 여부, 오차, 반복 횟수 로깅
   * - 외부 콜백 호출
   */
  const handleSolve = useCallback(
    (result: IKSolveResult) => {
      const status = result.success
        ? "✓ Success"
        : `✗ Failed (error: ${result.error.toFixed(4)})`;
      console.log(
        `[RobotMesh] IK Solve ${status} | Iterations: ${result.iterations}`,
      );

      onIKSolve?.(result);
    },
    [onIKSolve],
  );

  /**
   * 드래그 시작 핸들러
   */
  const handleDragStart = useCallback(() => {
    onDragStateChange?.(true);
    console.log("[RobotMesh] IK drag started");
  }, [onDragStateChange]);

  /**
   * 드래그 종료 핸들러
   */
  const handleDragEnd = useCallback(() => {
    onDragStateChange?.(false);
    console.log("[RobotMesh] IK drag ended");
  }, [onDragStateChange]);

  /**
   * 에러 핸들러
   */
  const handleError = useCallback(
    (errorMessage: string) => {
      const msg = `Failed to load robot model: ${errorMessage}`;
      console.error("[RobotMesh]", msg);
      onError?.(msg);
    },
    [onError],
  );

  return (
    <>
      {/* URDF 모델 로더 */}
      <URDFModel
        ref={modelRef}
        url={ROBOT_CONFIG.urdfUrl}
        jointValues={jointValues}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* 역기구학 인터랙션 컨트롤러 */}
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
          draggingFollowLerp={0.5}
        />
      )}
    </>
  );
}
