"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, CameraControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Box3, Material, Mesh, PCFShadowMap, Sphere, Vector3 } from "three";
import { IKSolveResult, ThreeJSURDFModel } from "three-urdf-loader";
import { RobotMesh } from "./RobotModel";
import {
  ObjectAddPanel,
  ScenePrimitiveObject,
} from "./UI/panel/ObjectAddPanel";
import { RobotInfoPanel } from "./UI/panel/RobotInfoPanel";
import {
  onBeforeCompileHologram,
  setHologramCircleCenter,
  setHologramCircleRadius,
  updateHologramTime,
} from "../shader/scanline";

const END_EFFECTOR_NAME = "kuka_arm_7_link";
const DEFAULT_COLLISION_CONTACT_EPSILON = 0.03;

type CollisionLinkScope = "all" | "endEffector";

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

interface CollisionAwarePrimitiveProps {
  objects: ScenePrimitiveObject[];
  robotModel: ThreeJSURDFModel | null;
  collisionContactEpsilon: number;
  collisionLinkScope: CollisionLinkScope;
  endEffectorName: string;
}

type HologramMaterial = Material & {
  onBeforeCompile: (shaderObject: any, renderer: any) => void;
  customProgramCacheKey?: (() => string) | undefined;
  userData: {
    _hologramEnabled?: boolean;
    _originalOnBeforeCompile?:
      | ((shaderObject: any, renderer: any) => void)
      | null;
    _originalProgramCacheKey?: (() => string) | null;
  };
};

function enableHologram(material: HologramMaterial) {
  if (material.userData._hologramEnabled) {
    return;
  }

  material.userData._originalOnBeforeCompile = material.onBeforeCompile;
  material.userData._originalProgramCacheKey = material.customProgramCacheKey;
  material.onBeforeCompile = onBeforeCompileHologram;
  material.customProgramCacheKey = () => "scanline-hologram-v1";
  material.userData._hologramEnabled = true;
  material.needsUpdate = true;
}

function disableHologram(material: HologramMaterial) {
  if (!material.userData._hologramEnabled) {
    return;
  }

  material.onBeforeCompile =
    material.userData._originalOnBeforeCompile ?? (() => {});
  material.customProgramCacheKey =
    material.userData._originalProgramCacheKey ?? undefined;
  material.userData._hologramEnabled = false;
  material.needsUpdate = true;
}

function collectRobotHologramMaterials(
  robotModel: ThreeJSURDFModel,
): HologramMaterial[] {
  const materials = new Set<HologramMaterial>();

  robotModel.traverse((node) => {
    const meshNode = node as Mesh;
    if (!meshNode.isMesh || !meshNode.material) {
      return;
    }

    const arr = Array.isArray(meshNode.material)
      ? meshNode.material
      : [meshNode.material];

    for (const material of arr) {
      const maybe = material as Partial<HologramMaterial>;
      if (
        maybe &&
        typeof maybe.onBeforeCompile === "function" &&
        maybe.userData
      ) {
        materials.add(maybe as HologramMaterial);
      }
    }
  });

  return [...materials];
}

function collectCollisionMeshes(
  robotModel: ThreeJSURDFModel,
  scope: CollisionLinkScope,
  endEffectorName: string,
): Mesh[] {
  const root =
    scope === "endEffector"
      ? (robotModel.getLinkByName(endEffectorName) ?? robotModel)
      : robotModel;
  const meshes: Mesh[] = [];

  root.traverse((node) => {
    const meshNode = node as Mesh;
    if (!meshNode.isMesh || !meshNode.geometry) {
      return;
    }

    if (!meshNode.geometry.boundingBox) {
      meshNode.geometry.computeBoundingBox();
    }

    if (meshNode.geometry.boundingBox) {
      meshes.push(meshNode);
    }
  });

  return meshes;
}

function RobotCollisionShaderController({
  objects,
  robotModel,
  collisionContactEpsilon,
  collisionLinkScope,
  endEffectorName,
}: CollisionAwarePrimitiveProps) {
  const objectPos = useRef(new Vector3());
  const robotMeshBounds = useRef(new Box3());
  const objectBounds = useRef(new Box3());
  const objectSphere = useRef(new Sphere());
  const closestOnRobot = useRef(new Vector3());
  const collisionCenter = useRef(new Vector3());
  const hologramMaterialsRef = useRef<HologramMaterial[]>([]);
  const collisionMeshesRef = useRef<Mesh[]>([]);
  const collisionStateRef = useRef(false);

  useEffect(() => {
    const prevMaterials = hologramMaterialsRef.current;
    for (const material of prevMaterials) {
      disableHologram(material);
    }

    if (!robotModel) {
      hologramMaterialsRef.current = [];
      collisionMeshesRef.current = [];
      return;
    }

    hologramMaterialsRef.current = collectRobotHologramMaterials(robotModel);
    collisionMeshesRef.current = collectCollisionMeshes(
      robotModel,
      collisionLinkScope,
      endEffectorName,
    );

    return () => {
      for (const material of hologramMaterialsRef.current) {
        disableHologram(material);
      }
      hologramMaterialsRef.current = [];
      collisionMeshesRef.current = [];
      collisionStateRef.current = false;
    };
  }, [robotModel, collisionLinkScope, endEffectorName]);

  useFrame(({ clock }) => {
    updateHologramTime(clock.getElapsedTime());

    if (
      !robotModel ||
      objects.length === 0 ||
      collisionMeshesRef.current.length === 0
    ) {
      if (collisionStateRef.current) {
        for (const material of hologramMaterialsRef.current) {
          disableHologram(material);
        }
        collisionStateRef.current = false;
      }
      return;
    }

    robotModel.updateMatrixWorld(true);

    let isCollisionExpected = false;
    let closestDistance = Number.POSITIVE_INFINITY;
    let closestRadius = collisionContactEpsilon;

    for (const object of objects) {
      objectPos.current.set(...object.position);
      const half = object.size / 2;

      if (object.type === "sphere") {
        objectSphere.current.center.copy(objectPos.current);
        objectSphere.current.radius = half + collisionContactEpsilon;
      } else if (object.type === "box") {
        const expandedHalf = half + collisionContactEpsilon;
        objectBounds.current.min.set(
          objectPos.current.x - expandedHalf,
          objectPos.current.y - expandedHalf,
          objectPos.current.z - expandedHalf,
        );
        objectBounds.current.max.set(
          objectPos.current.x + expandedHalf,
          objectPos.current.y + expandedHalf,
          objectPos.current.z + expandedHalf,
        );
      } else {
        const radius = half + collisionContactEpsilon;
        const halfHeight = half + collisionContactEpsilon;
        objectBounds.current.min.set(
          objectPos.current.x - radius,
          objectPos.current.y - halfHeight,
          objectPos.current.z - radius,
        );
        objectBounds.current.max.set(
          objectPos.current.x + radius,
          objectPos.current.y + halfHeight,
          objectPos.current.z + radius,
        );
      }

      for (const meshNode of collisionMeshesRef.current) {
        robotMeshBounds.current
          .copy(meshNode.geometry.boundingBox)
          .applyMatrix4(meshNode.matrixWorld);

        const intersects =
          object.type === "sphere"
            ? robotMeshBounds.current.intersectsSphere(objectSphere.current)
            : robotMeshBounds.current.intersectsBox(objectBounds.current);

        if (!intersects) {
          continue;
        }

        isCollisionExpected = true;
        robotMeshBounds.current.clampPoint(
          objectPos.current,
          closestOnRobot.current,
        );
        const distance = closestOnRobot.current.distanceTo(objectPos.current);

        if (distance < closestDistance) {
          closestDistance = distance;
          collisionCenter.current.copy(closestOnRobot.current);
          closestRadius = Math.max(half + collisionContactEpsilon, 0.1);
        }

        break;
      }

      if (isCollisionExpected) {
        break;
      }
    }

    if (isCollisionExpected) {
      for (const material of hologramMaterialsRef.current) {
        enableHologram(material);
      }
      if (Number.isFinite(closestDistance)) {
        setHologramCircleCenter(collisionCenter.current);
      } else {
        setHologramCircleCenter(objectPos.current);
      }
      setHologramCircleRadius(closestRadius);
      collisionStateRef.current = true;
      return;
    }

    if (collisionStateRef.current) {
      for (const material of hologramMaterialsRef.current) {
        disableHologram(material);
      }
      collisionStateRef.current = false;
    }
  });

  return null;
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
  const [objects, setObjects] = useState<ScenePrimitiveObject[]>([]);
  const [collisionContactEpsilon, setCollisionContactEpsilon] = useState(
    DEFAULT_COLLISION_CONTACT_EPSILON,
  );
  const [collisionLinkScope, setCollisionLinkScope] =
    useState<CollisionLinkScope>("all");

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
      <Canvas shadows={{ type: PCFShadowMap }}>
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

        <RobotCollisionShaderController
          robotModel={robotModel}
          objects={objects}
          collisionContactEpsilon={collisionContactEpsilon}
          collisionLinkScope={collisionLinkScope}
          endEffectorName={END_EFFECTOR_NAME}
        />

        {objects.map((object) => (
          <mesh
            key={object.id}
            position={object.position}
            castShadow
            receiveShadow
          >
            {object.type === "box" && (
              <boxGeometry args={[object.size, object.size, object.size]} />
            )}
            {object.type === "sphere" && (
              <sphereGeometry args={[object.size / 2, 24, 24]} />
            )}
            {object.type === "cylinder" && (
              <cylinderGeometry
                args={[object.size / 2, object.size / 2, object.size, 24]}
              />
            )}
            <meshStandardMaterial color={object.color} />
          </mesh>
        ))}

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
        collisionContactEpsilon={collisionContactEpsilon}
        collisionLinkScope={collisionLinkScope}
        onCollisionContactEpsilonChange={setCollisionContactEpsilon}
        onCollisionLinkScopeChange={setCollisionLinkScope}
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

      <ObjectAddPanel
        objects={objects}
        onAddObject={(newObject) => {
          const id =
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

          setObjects((prev) => [...prev, { ...newObject, id }]);
        }}
        onRemoveObject={(id) => {
          setObjects((prev) => prev.filter((object) => object.id !== id));
        }}
        onClearObjects={() => {
          setObjects([]);
        }}
      />
    </div>
  );
}
