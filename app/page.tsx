import Scene from '@/components/Scene';
import { SelectionProvider } from '@/components/SelectionContext';
import { SelectionPanelWrapper } from '@/components/SelectionPanelWrapper';

export default function Home() {
  return (
    <SelectionProvider>
      <main className="flex flex-col w-full h-screen">
        <header className="px-6 py-4 bg-gray-950 text-white flex items-center gap-3 z-10">
          <h1 className="text-xl font-semibold tracking-tight">it-s-me</h1>
          <span className="text-gray-400 text-sm">
            Three.js · react-three-fiber · URDF robot explorer
          </span>
        </header>
        <div className="flex-1 overflow-hidden relative">
          <Scene />
          <SelectionPanelWrapper />
        </div>
      </main>
    </SelectionProvider>
  );
}
