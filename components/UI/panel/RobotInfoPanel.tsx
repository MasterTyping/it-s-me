import { useMemo } from "react";
import { Vector3 } from "three";
import { IKSolveResult, ThreeJSURDFModel } from "three-urdf-loader";

interface RobotInfoPanelProps {
  model: ThreeJSURDFModel | null;
  isIKDragging: boolean;
  lastIKResult: IKSolveResult | null;
  errorMessage: string | null;
  endEffectorName: string;
}

export function RobotInfoPanel({
  model,
  isIKDragging,
  lastIKResult,
  errorMessage,
  endEffectorName,
}: RobotInfoPanelProps) {
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
  }, [model, endEffectorName, lastIKResult]);

  return (
    <aside className="absolute right-4 top-4 z-20 w-80 rounded-xl border border-white/20 bg-black/70 p-4 text-xs text-white backdrop-blur-sm">
      <h2 className="mb-3 text-sm font-semibold">Robot Info Panel</h2>

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

      {errorMessage && (
        <p className="mt-3 rounded-md border border-red-300/50 bg-red-900/30 p-2 text-[11px] text-red-100">
          {errorMessage}
        </p>
      )}
    </aside>
  );
}
