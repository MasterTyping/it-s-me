import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { URDFModel, URDFModelRef, useURDFLoader } from "three-urdf-loader";

export function RobotMesh() {
  const modelRef = useRef<URDFModelRef>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const { loadFromURL, loading, error } = useURDFLoader();
  const path = "/data/kuka_lwr/kuka.urdf";

  useEffect(() => {
    loadFromURL(path);
  }, [loadFromURL, path]);

  return null;
  // return (
  //   <URDFModel
  //     ref={modelRef}
  //     url="/data/kuka_lwr/kuka.urdf"
  //     onLoad={(model) => {
  //       const axis = new THREE.Vector3(1, 0, 0);
  //       const angle = -Math.PI / 2;
  //       const quaternion = new THREE.Quaternion();
  //       quaternion.setFromAxisAngle(axis, angle);

  //       model.quaternion.multiplyQuaternions(quaternion, model.quaternion);
  //       model.updateMatrixWorld(true);
  //       setIsModelLoaded(true);
  //     }}
  //     onProgress={(progress) => {
  //       console.log(
  //         `[RobotMesh] Loading progress: ${(progress * 100).toFixed(1)}%`,
  //       );
  //     }}
  //     onError={(error) => {
  //       console.error("[RobotMesh] Loading failed:", error);
  //     }}
  //   />
  // );
}
