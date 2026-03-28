import { useState } from "react";
import { FloatingPanel } from "./FloatingPanel";

export type PrimitiveType = "box" | "sphere" | "cylinder";

export interface ScenePrimitiveObject {
  id: string;
  type: PrimitiveType;
  color: string;
  position: [number, number, number];
  size: number;
}

interface ObjectAddPanelProps {
  objects: ScenePrimitiveObject[];
  onAddObject: (object: Omit<ScenePrimitiveObject, "id">) => void;
  onRemoveObject: (id: string) => void;
  onClearObjects: () => void;
}

export function ObjectAddPanel({
  objects,
  onAddObject,
  onRemoveObject,
  onClearObjects,
}: ObjectAddPanelProps) {
  const [type, setType] = useState<PrimitiveType>("box");
  const [color, setColor] = useState("#ff8a00");
  const [size, setSize] = useState(0.25);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0.25);
  const [posZ, setPosZ] = useState(0);

  return (
    <FloatingPanel
      title="Object Add Panel"
      initialRect={{ x: 400, y: 16, width: 340, height: 560 }}
      headerActions={
        <button
          type="button"
          onClick={onClearObjects}
          className="rounded border border-white/30 px-2 py-1 text-[11px] text-gray-100 hover:bg-white/10"
        >
          Clear
        </button>
      }
    >
      <div className="space-y-3">
        <div className="rounded-md border border-white/15 p-3">
          <h3 className="mb-2 text-[11px] font-medium text-gray-300">
            New Object
          </h3>

          <div className="space-y-2 text-[11px] text-gray-200">
            <label className="block">
              <span className="mb-1 block text-gray-400">Type</span>
              <select
                className="w-full rounded border border-white/20 bg-black/50 px-2 py-1"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as PrimitiveType)
                }
              >
                <option value="box">Box</option>
                <option value="sphere">Sphere</option>
                <option value="cylinder">Cylinder</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-gray-400">Color</span>
              <input
                type="color"
                className="h-8 w-full rounded border border-white/20 bg-black/50"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-gray-400">Size</span>
              <input
                className="w-full"
                type="range"
                min={0.05}
                max={1.0}
                step={0.01}
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
              />
              <span className="text-gray-400">{size.toFixed(2)}</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <label className="block">
                <span className="mb-1 block text-gray-400">X</span>
                <input
                  className="w-full rounded border border-white/20 bg-black/50 px-2 py-1"
                  type="number"
                  step={0.1}
                  value={posX}
                  onChange={(event) => setPosX(Number(event.target.value))}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-gray-400">Y</span>
                <input
                  className="w-full rounded border border-white/20 bg-black/50 px-2 py-1"
                  type="number"
                  step={0.1}
                  value={posY}
                  onChange={(event) => setPosY(Number(event.target.value))}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-gray-400">Z</span>
                <input
                  className="w-full rounded border border-white/20 bg-black/50 px-2 py-1"
                  type="number"
                  step={0.1}
                  value={posZ}
                  onChange={(event) => setPosZ(Number(event.target.value))}
                />
              </label>
            </div>
          </div>

          <button
            type="button"
            className="mt-3 w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-[11px] font-medium hover:bg-white/20"
            onClick={() => {
              onAddObject({
                type,
                color,
                size,
                position: [posX, posY, posZ],
              });
            }}
          >
            Add Object
          </button>
        </div>

        <div className="rounded-md border border-white/15 p-3">
          <h3 className="mb-2 text-[11px] font-medium text-gray-300">
            Objects ({objects.length})
          </h3>
          <div className="scrollbar-dark max-h-44 space-y-1 overflow-y-auto pr-1 text-[11px]">
            {objects.length === 0 && (
              <p className="text-gray-500">No objects added.</p>
            )}

            {objects.map((object) => (
              <div
                key={object.id}
                className="flex items-center justify-between rounded border border-white/10 px-2 py-1"
              >
                <div className="min-w-0">
                  <p className="truncate text-gray-200">
                    {object.type} / {object.size.toFixed(2)}
                  </p>
                  <p className="truncate text-gray-500">
                    ({object.position[0].toFixed(2)},{" "}
                    {object.position[1].toFixed(2)},{" "}
                    {object.position[2].toFixed(2)})
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded border border-red-300/40 px-2 py-0.5 text-[10px] text-red-200 hover:bg-red-900/30"
                  onClick={() => onRemoveObject(object.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FloatingPanel>
  );
}
