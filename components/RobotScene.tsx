"use client";

import { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CoordinateGrid from "./CoordinateGrid";
import URDFRobot, { URDFState } from "./URDFScene";

const DEFAULT_STATE: URDFState = {
  joint1: { angle: 0, offset: 0 },
  joint2: { angle: 0, offset: 0 },
};

/**
 * Interactive 3-D viewport that combines:
 *  - A coordinate grid (XZ plane + axis arrows)
 *  - A 2-DOF URDF-style robot arm
 *  - Controls panel so the user can manipulate joint angles via sliders
 */
export default function RobotScene() {
  const [robotState, setRobotState] = useState<URDFState>(DEFAULT_STATE);

  const setJoint1Angle = useCallback((angle: number) => {
    setRobotState((prev) => ({ ...prev, joint1: { ...prev.joint1, angle } }));
  }, []);

  const setJoint2Angle = useCallback((angle: number) => {
    setRobotState((prev) => ({ ...prev, joint2: { ...prev.joint2, angle } }));
  }, []);

  const reset = useCallback(() => setRobotState(DEFAULT_STATE), []);

  return (
    <div className="flex flex-col h-full w-full">
      {/* 3-D canvas */}
      <div className="flex-1 w-full" style={{ minHeight: "60vh" }}>
        <Canvas
          camera={{ position: [4, 4, 4], fov: 50 }}
          shadows
          style={{ background: "#1a1a2e" }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Grid + axes */}
          <CoordinateGrid gridSize={10} gridDivisions={10} />

          {/* URDF robot – position slightly above ground so base sits on it */}
          <group position={[0, 0.1, 0]}>
            <URDFRobot state={robotState} />
          </group>

          {/* Camera controls */}
          <OrbitControls makeDefault />
        </Canvas>
      </div>

      {/* Controls panel */}
      <div className="flex flex-col gap-4 p-6 bg-gray-900 text-white">
        <h2 className="text-lg font-semibold">Joint Controls</h2>

        <label className="flex flex-col gap-1 text-sm">
          <span>
            Joint 1 angle:{" "}
            <span className="font-mono">
              {((robotState.joint1.angle * 180) / Math.PI).toFixed(0)}°
            </span>
          </span>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.01}
            value={robotState.joint1.angle}
            onChange={(e) => setJoint1Angle(parseFloat(e.target.value))}
            className="accent-blue-400"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>
            Joint 2 angle:{" "}
            <span className="font-mono">
              {((robotState.joint2.angle * 180) / Math.PI).toFixed(0)}°
            </span>
          </span>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.01}
            value={robotState.joint2.angle}
            onChange={(e) => setJoint2Angle(parseFloat(e.target.value))}
            className="accent-red-400"
          />
        </label>

        <button
          onClick={reset}
          className="mt-2 rounded-md bg-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-600 active:bg-gray-500 transition-colors self-start"
        >
          Reset to zero
        </button>
      </div>
    </div>
  );
}
