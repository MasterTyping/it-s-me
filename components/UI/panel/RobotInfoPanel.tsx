import { useMemo, useState } from "react";
import { Vector3 } from "three";
import { IKSolveResult, ThreeJSURDFModel } from "three-urdf-loader";
import { FloatingPanel } from "./FloatingPanel";

interface RobotInfoPanelProps {
  model: ThreeJSURDFModel | null;
  isIKDragging: boolean;
  lastIKResult: IKSolveResult | null;
  errorMessage: string | null;
  endEffectorName: string;
  jointValues: Record<string, number>;
  onJointValueChange: (jointName: string, value: number) => void;
  onResetPose: () => void;
}

interface JointSliderInfo {
  name: string;
  type: "revolute" | "prismatic";
  min: number;
  max: number;
  step: number;
}

const RAD_TO_DEG = 180 / Math.PI;

function getJointGroupLabel(name: string): string {
  const match = name.match(/^(.*?)(?:_\d+)?_joint$/);
  if (match?.[1]) {
    return match[1];
  }
  return "other";
}

function toDisplayValue(
  value: number,
  type: JointSliderInfo["type"],
  useDegree: boolean,
): number {
  if (type === "revolute" && useDegree) {
    return value * RAD_TO_DEG;
  }
  return value;
}

function toModelValue(
  value: number,
  type: JointSliderInfo["type"],
  useDegree: boolean,
): number {
  if (type === "revolute" && useDegree) {
    return value / RAD_TO_DEG;
  }
  return value;
}

export function RobotInfoPanel({
  model,
  isIKDragging,
  lastIKResult,
  errorMessage,
  endEffectorName,
  jointValues,
  onJointValueChange,
  onResetPose,
}: RobotInfoPanelProps) {
  const [angleUnit, setAngleUnit] = useState<"rad" | "deg">("rad");
  const [groupOpenState, setGroupOpenState] = useState<Record<string, boolean>>(
    {},
  );

  const summary = useMemo(() => {
    if (!model) {
      return {
        robotName: "-",
        jointCount: 0,
        linkCount: 0,
        endEffectorPosition: "-",
        activeJointValues: [] as Array<[string, number]>,
      };
    }

    model.updateMatrixWorld(true);
    const endEffector = model.getLinkByName(endEffectorName);
    const positionText = endEffector
      ? (() => {
          const p = endEffector.getWorldPosition(new Vector3());
          return `(${p.x.toFixed(3)}, ${p.y.toFixed(3)}, ${p.z.toFixed(3)})`;
        })()
      : "not found";

    const jointValues = Object.entries(model.getJointValues()).slice(0, 6);

    return {
      robotName: model.modelInfo.robot.name,
      jointCount: model.joints.size,
      linkCount: model.links.size,
      endEffectorPosition: positionText,
      activeJointValues: jointValues,
    };
  }, [model, endEffectorName]);

  const jointSliders = useMemo<JointSliderInfo[]>(() => {
    if (!model) {
      return [];
    }

    return model.modelInfo.joints
      .filter((joint) => {
        return joint.type === "revolute" || joint.type === "prismatic";
      })
      .map((joint) => {
        const type: JointSliderInfo["type"] =
          joint.type === "prismatic" ? "prismatic" : "revolute";
        const isPrismatic = type === "prismatic";
        const lower = joint.limit?.lower;
        const upper = joint.limit?.upper;

        return {
          name: joint.name,
          type,
          min: Number.isFinite(lower) ? lower! : isPrismatic ? -0.2 : -Math.PI,
          max: Number.isFinite(upper) ? upper! : isPrismatic ? 0.2 : Math.PI,
          step: isPrismatic ? 0.001 : 0.01,
        };
      });
  }, [model]);

  const groupedJointSliders = useMemo(() => {
    const groups: Record<string, JointSliderInfo[]> = {};
    for (const slider of jointSliders) {
      const groupName = getJointGroupLabel(slider.name);
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(slider);
    }

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [jointSliders]);

  const useDegree = angleUnit === "deg";

  return (
    <FloatingPanel
      title="Robot Info Panel"
      initialRect={{ x: 16, y: 16, width: 360, height: 640 }}
      headerActions={
        <button
          type="button"
          onClick={onResetPose}
          className="rounded border border-white/30 px-2 py-1 text-[11px] text-gray-100 hover:bg-white/10"
        >
          Reset Pose
        </button>
      }
    >
      <div className="space-y-1 text-gray-200">
        <p>
          <span className="text-gray-400">Robot:</span> {summary.robotName}
        </p>
        <p>
          <span className="text-gray-400">Joints:</span> {summary.jointCount}
        </p>
        <p>
          <span className="text-gray-400">Links:</span> {summary.linkCount}
        </p>
        <p>
          <span className="text-gray-400">End Effector:</span> {endEffectorName}
        </p>
        <p>
          <span className="text-gray-400">EE Position:</span>{" "}
          {summary.endEffectorPosition}
        </p>
        <p>
          <span className="text-gray-400">IK Dragging:</span>{" "}
          {isIKDragging ? "Yes" : "No"}
        </p>
        <p>
          <span className="text-gray-400">IK Solve:</span>{" "}
          {lastIKResult ? (lastIKResult.success ? "Success" : "Failed") : "-"}
        </p>
        <p>
          <span className="text-gray-400">IK Error:</span>{" "}
          {lastIKResult ? lastIKResult.error.toFixed(5) : "-"}
        </p>
        <p>
          <span className="text-gray-400">Iterations:</span>{" "}
          {lastIKResult ? lastIKResult.iterations : "-"}
        </p>
      </div>

      {summary.activeJointValues.length > 0 && (
        <div className="mt-3 rounded-md border border-white/15 p-2">
          <h3 className="mb-2 text-[11px] font-medium text-gray-300">
            Joint Values (top 6)
          </h3>
          <ul className="space-y-1 text-[11px] text-gray-200">
            {summary.activeJointValues.map(([name, value]) => (
              <li key={name} className="flex justify-between gap-3">
                <span className="truncate text-gray-400">{name}</span>
                <span>{value.toFixed(4)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {jointSliders.length > 0 && (
        <div className="mt-3 rounded-md border border-white/15 p-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-[11px] font-medium text-gray-300">
              Joint Sliders
            </h3>
            <div className="flex overflow-hidden rounded border border-white/25 text-[10px]">
              <button
                type="button"
                onClick={() => setAngleUnit("rad")}
                className={`px-2 py-1 ${angleUnit === "rad" ? "bg-white/20 text-white" : "text-gray-300"}`}
              >
                rad
              </button>
              <button
                type="button"
                onClick={() => setAngleUnit("deg")}
                className={`px-2 py-1 ${angleUnit === "deg" ? "bg-white/20 text-white" : "text-gray-300"}`}
              >
                deg
              </button>
            </div>
          </div>

          <div className="scrollbar-dark max-h-56 space-y-2 overflow-y-auto pr-1">
            {groupedJointSliders.map(([groupName, joints]) => {
              const isOpen = groupOpenState[groupName] ?? true;

              return (
                <div
                  key={groupName}
                  className="rounded border border-white/10 p-2"
                >
                  <button
                    type="button"
                    className="mb-2 flex w-full items-center justify-between text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400"
                    onClick={() => {
                      setGroupOpenState((prev) => ({
                        ...prev,
                        [groupName]: !(prev[groupName] ?? true),
                      }));
                    }}
                  >
                    <span>{groupName}</span>
                    <span className="text-gray-500">{isOpen ? "-" : "+"}</span>
                  </button>

                  {isOpen && (
                    <div className="space-y-2">
                      {joints.map((joint) => {
                        const rawValue = jointValues[joint.name] ?? 0;
                        const displayValue = toDisplayValue(
                          rawValue,
                          joint.type,
                          useDegree,
                        );
                        const min = toDisplayValue(
                          joint.min,
                          joint.type,
                          useDegree,
                        );
                        const max = toDisplayValue(
                          joint.max,
                          joint.type,
                          useDegree,
                        );
                        const step =
                          joint.type === "revolute" && useDegree
                            ? Math.max(joint.step * RAD_TO_DEG, 0.1)
                            : joint.step;
                        const unitLabel =
                          joint.type === "revolute"
                            ? useDegree
                              ? "deg"
                              : "rad"
                            : "m";

                        return (
                          <label key={joint.name} className="block text-[11px]">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="truncate text-gray-400">
                                {joint.name}
                              </span>
                              <span className="text-gray-200">
                                {displayValue.toFixed(3)} {unitLabel}
                              </span>
                            </div>
                            <input
                              className="w-full"
                              type="range"
                              min={min}
                              max={max}
                              step={step}
                              value={displayValue}
                              onChange={(event) => {
                                const nextDisplayValue = Number(
                                  event.target.value,
                                );
                                const nextModelValue = toModelValue(
                                  nextDisplayValue,
                                  joint.type,
                                  useDegree,
                                );
                                onJointValueChange(joint.name, nextModelValue);
                              }}
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="mt-3 rounded-md border border-red-300/50 bg-red-900/30 p-2 text-[11px] text-red-100">
          {errorMessage}
        </p>
      )}
    </FloatingPanel>
  );
}
