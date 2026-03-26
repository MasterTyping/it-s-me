import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { URDFModel, URDFModelRef } from 'three-urdf-loader';

export function RobotMesh() {
  const modelRef = useRef<URDFModelRef>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  return (
    <URDFModel
      ref={modelRef}
      url="/data/kuka_lwr/kuka.urdf"
      onLoad={(model) => {
        console.log('[RobotMesh] URDF model loaded successfully:', model);
        const jointValues: Record<string, number> = {};
        console.log(
          '[RobotMesh] Initial joint values:',
          model.getJointValues(),
        );

        const axis = new THREE.Vector3(1, 0, 0);
        const angle = -Math.PI / 2;
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(axis, angle);

        model.quaternion.multiplyQuaternions(quaternion, model.quaternion);
        model.updateMatrixWorld(true);
        setIsModelLoaded(true);
      }}
      onProgress={(progress) => {
        console.log(
          `[RobotMesh] Loading progress: ${(progress * 100).toFixed(1)}%`,
        );
      }}
      onError={(error) => {
        console.error('[RobotMesh] Loading failed:', error);
      }}
    />
  );
}
