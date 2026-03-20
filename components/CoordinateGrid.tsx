"use client";

/**
 * Renders a coordinate-axis helper (X=red, Y=green, Z=blue) and a flat grid
 * on the XZ plane so the scene has a visible ground reference.
 */
export default function CoordinateGrid({
  gridSize = 10,
  gridDivisions = 10,
}: {
  gridSize?: number;
  gridDivisions?: number;
}) {
  return (
    <group>
      {/* Flat XZ grid */}
      <gridHelper args={[gridSize, gridDivisions, "#888888", "#444444"]} />

      {/* Axis arrows: X (red), Y (green), Z (blue) */}
      <axesHelper args={[gridSize / 2]} />
    </group>
  );
}
