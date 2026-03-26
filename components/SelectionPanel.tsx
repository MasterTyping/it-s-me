'use client';

export interface SelectedObject {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  geometryType: string;
  materialType: string;
  materialColor?: string;
}

export interface SelectionPanelProps {
  selectedObject: SelectedObject | null;
}

export function SelectionPanel({ selectedObject }: SelectionPanelProps) {
  if (!selectedObject) {
    return (
      <div className="absolute top-20 left-4 bg-gray-900 text-white p-4 rounded-lg w-80 border border-gray-700 shadow-lg z-20">
        <h3 className="text-lg font-semibold mb-3 text-gray-200">
          선택된 객체
        </h3>
        <p className="text-gray-400 text-sm">선택 안됨</p>
      </div>
    );
  }

  const formatNumber = (num: number) => num.toFixed(2);

  return (
    <div className="absolute top-20 left-4 bg-gray-900 text-white p-4 rounded-lg w-80 border border-gray-700 shadow-lg z-20">
      <h3 className="text-lg font-semibold mb-3 text-gray-200">선택된 객체</h3>

      <div className="space-y-2 text-sm">
        {/* Name */}
        <div className="border-b border-gray-700 pb-2">
          <p className="text-gray-400">
            <span className="font-medium text-gray-300">이름:</span>{' '}
            <span className="text-white">{selectedObject.name}</span>
          </p>
        </div>

        {/* Position */}
        <div className="border-b border-gray-700 pb-2">
          <p className="text-gray-400 font-medium text-gray-300">
            위치 (Position)
          </p>
          <p className="text-gray-300 pl-2">
            X:{' '}
            <span className="text-cyan-400">
              {formatNumber(selectedObject.position[0])}
            </span>
          </p>
          <p className="text-gray-300 pl-2">
            Y:{' '}
            <span className="text-green-400">
              {formatNumber(selectedObject.position[1])}
            </span>
          </p>
          <p className="text-gray-300 pl-2">
            Z:{' '}
            <span className="text-red-400">
              {formatNumber(selectedObject.position[2])}
            </span>
          </p>
        </div>

        {/* Rotation */}
        <div className="border-b border-gray-700 pb-2">
          <p className="text-gray-400 font-medium text-gray-300">
            회전 (Rotation)
          </p>
          <p className="text-gray-300 pl-2">
            X:{' '}
            <span className="text-cyan-400">
              {formatNumber(selectedObject.rotation[0])}
            </span>
            °
          </p>
          <p className="text-gray-300 pl-2">
            Y:{' '}
            <span className="text-green-400">
              {formatNumber(selectedObject.rotation[1])}
            </span>
            °
          </p>
          <p className="text-gray-300 pl-2">
            Z:{' '}
            <span className="text-red-400">
              {formatNumber(selectedObject.rotation[2])}
            </span>
            °
          </p>
        </div>

        {/* Scale */}
        <div className="border-b border-gray-700 pb-2">
          <p className="text-gray-400 font-medium text-gray-300">
            스케일 (Scale)
          </p>
          <p className="text-gray-300 pl-2">
            X:{' '}
            <span className="text-cyan-400">
              {formatNumber(selectedObject.scale[0])}
            </span>
          </p>
          <p className="text-gray-300 pl-2">
            Y:{' '}
            <span className="text-green-400">
              {formatNumber(selectedObject.scale[1])}
            </span>
          </p>
          <p className="text-gray-300 pl-2">
            Z:{' '}
            <span className="text-red-400">
              {formatNumber(selectedObject.scale[2])}
            </span>
          </p>
        </div>

        {/* Material & Geometry */}
        <div>
          <p className="text-gray-400">
            <span className="font-medium text-gray-300">재질:</span>{' '}
            <span className="text-yellow-400">
              {selectedObject.materialType}
            </span>
          </p>
          {selectedObject.materialColor && (
            <p className="text-gray-400 mt-1">
              <span className="font-medium text-gray-300">색상:</span>{' '}
              <span
                className="inline-block ml-2 w-4 h-4 rounded border border-gray-600"
                style={{ backgroundColor: selectedObject.materialColor }}
                title={selectedObject.materialColor}
              />
              <span className="text-gray-300 ml-2">
                {selectedObject.materialColor}
              </span>
            </p>
          )}
          <p className="text-gray-400 mt-1">
            <span className="font-medium text-gray-300">기하학형:</span>{' '}
            <span className="text-purple-400">
              {selectedObject.geometryType}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
