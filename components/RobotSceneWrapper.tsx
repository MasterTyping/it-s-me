"use client";

import dynamic from "next/dynamic";

// RobotScene relies on browser WebGL APIs, so it must be client-side only.
const RobotScene = dynamic(() => import("@/components/RobotScene"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-[#1a1a2e] text-white text-sm">
      Loading 3D scene…
    </div>
  ),
});

export default function RobotSceneWrapper() {
  return <RobotScene />;
}
