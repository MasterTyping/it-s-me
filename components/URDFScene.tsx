"use client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JointState {
  /** Rotation in radians around the joint's local Y-axis */
  angle: number;
  /** Translation offset along the parent link's local Y-axis */
  offset: number;
}

export interface URDFState {
  joint1: JointState;
  joint2: JointState;
}

// ─── Individual link (box geometry) ──────────────────────────────────────────

interface LinkProps {
  size: [number, number, number];
  color: string;
  children?: React.ReactNode;
}

function Link({ size, color, children }: LinkProps) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      {children}
    </group>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface URDFSceneProps {
  state: URDFState;
}

/**
 * A simple URDF-style kinematic chain:
 *
 *   base_link  (grey box, 1×0.2×1)
 *       └── joint1  (revolute, rotates child around Y)
 *           └── link1  (blue box, 0.3×1×0.3)
 *               └── joint2  (revolute)
 *                   └── link2  (red box, 0.2×0.8×0.2)
 *
 * Joint angles and offsets are driven by the `state` prop so callers can
 * manipulate the hierarchy via a React state hook.
 */
export default function URDFRobot({ state }: URDFSceneProps) {
  return (
    <group>
      {/* Base link – sits on the ground plane */}
      <Link size={[1, 0.2, 1]} color="#7f8c8d">
        {/* Joint 1 – pivot at the top of the base link */}
        <group
          position={[0, 0.1 + state.joint1.offset, 0]}
          rotation={[0, state.joint1.angle, 0]}
        >
          {/* Link 1 – visual centre is half its height above the joint */}
          <group position={[0, 0.5, 0]}>
            <Link size={[0.3, 1, 0.3]} color="#2980b9">
              {/* Joint 2 – pivot at the top of link 1 */}
              <group
                position={[0, 0.5 + state.joint2.offset, 0]}
                rotation={[0, state.joint2.angle, 0]}
              >
                {/* Link 2 – visual centre is half its height above joint 2 */}
                <group position={[0, 0.4, 0]}>
                  <Link size={[0.2, 0.8, 0.2]} color="#e74c3c" />
                </group>
              </group>
            </Link>
          </group>
        </group>
      </Link>
    </group>
  );
}
