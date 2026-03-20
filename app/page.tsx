import RobotSceneWrapper from "@/components/RobotSceneWrapper";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 w-full h-screen">
      <header className="px-6 py-4 bg-gray-950 text-white flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">it-s-me</h1>
        <span className="text-gray-400 text-sm">
          Three.js · react-three-fiber · URDF robot explorer
        </span>
      </header>
      <div className="flex-1 flex flex-col overflow-hidden">
        <RobotSceneWrapper />
      </div>
    </main>
  );
}
