import { Color, WebGLRenderer, Vector3 } from "three";

const vertexShaderPars = `
  varying vec3 vWorldPosition;
`;

const vertexShaderMain = `
  vWorldPosition = worldPosition.xyz;
`;
const fragmentShaderPars = `
  uniform float uTime;
  uniform vec3 uScanColor;
  uniform float uScanSpeed;
  uniform float uScanWidth;
  uniform vec3 uCircleCenter;
  uniform float uCircleRadius;
  varying vec3 vWorldPosition;
`;

const fragmentShaderMain = `
  float speed = uTime * uScanSpeed;
  
  // 중심점에서의 거리 계산 (Z축 무시하고 XY 평면에서)
  vec2 centerXY = uCircleCenter.xy;
  vec2 posXY = vWorldPosition.xy;
  float distFromCenter = length(posXY - centerXY);
  
  // 중심에서 바깥으로 퍼져나가는 파동
  float wavePos = mod(distFromCenter - speed, 3.0);
  float waveDist = abs(wavePos - 1.5);
  float waveIntensity = smoothstep(uScanWidth + 0.3, 0.0, waveDist);
  
  // 글로우 효과
  float glowIntensity = smoothstep(uScanWidth + 0.8, 0.0, waveDist) * 0.4;
  
  // 섬광 효과 (거리에 따라 변함)
  float flicker = sin(uTime * 3.0 + distFromCenter) * 0.5 + 0.5;
  float finalIntensity = waveIntensity + glowIntensity * flicker;
  
  gl_FragColor.rgb = mix(gl_FragColor.rgb, uScanColor, finalIntensity * 0.8);
`;

interface HologramUniforms {
  uTime: { value: number };
  uScanColor: { value: Color };
  uCircleColor: { value: Color };
  uScanSpeed: { value: number };
  uScanWidth: { value: number };
  uGroundLevel: { value: number };
  uCircleCenter: { value: Vector3 };
  uCircleRadius: { value: number };
}

const uniforms: HologramUniforms = {
  uTime: { value: 0 },
  uScanColor: { value: new Color("#ff7f3a") },
  uCircleColor: { value: new Color("#ff7b00") },
  uScanSpeed: { value: 1.0 },
  uScanWidth: { value: 0.15 },
  uGroundLevel: { value: 1.0 },
  uCircleCenter: { value: new Vector3(0, 0, 0) }, // 원 중심점
  uCircleRadius: { value: 1.0 }, // 원 반경
};

export const onBeforeCompileHologram = (
  shaderObject: any,
  renderer: WebGLRenderer,
) => {
  shaderObject.uniforms.uTime = uniforms.uTime;
  shaderObject.uniforms.uScanColor = uniforms.uScanColor;
  shaderObject.uniforms.uCircleColor = uniforms.uCircleColor;
  shaderObject.uniforms.uScanSpeed = uniforms.uScanSpeed;
  shaderObject.uniforms.uScanWidth = uniforms.uScanWidth;
  shaderObject.uniforms.uGroundLevel = uniforms.uGroundLevel;
  shaderObject.uniforms.uCircleCenter = uniforms.uCircleCenter;
  shaderObject.uniforms.uCircleRadius = uniforms.uCircleRadius;
  shaderObject.vertexShader = shaderObject.vertexShader.replace(
    "#include <common>",
    `#include <common>\n${vertexShaderPars}`,
  );

  shaderObject.vertexShader = shaderObject.vertexShader.replace(
    "#include <worldpos_vertex>",
    `#include <worldpos_vertex>\n${vertexShaderMain}`,
  );

  shaderObject.fragmentShader = shaderObject.fragmentShader.replace(
    "#include <common>",
    `#include <common>\n${fragmentShaderPars}`,
  );
  shaderObject.fragmentShader = shaderObject.fragmentShader.replace(
    "#include <dithering_fragment>",
    `#include <dithering_fragment>\n${fragmentShaderMain}`,
  );
};

export const updateHologramTime = (elapsedTime: number) => {
  uniforms.uTime.value = elapsedTime;
};

export const setHologramCircleCenter = (center: Vector3) => {
  uniforms.uCircleCenter.value.copy(center);
};

export const setHologramCircleRadius = (radius: number) => {
  uniforms.uCircleRadius.value = radius;
};

export const setHologramScanWidth = (width: number) => {
  uniforms.uScanWidth.value = width;
};

export const setHologramScanSpeed = (speed: number) => {
  uniforms.uScanSpeed.value = speed;
};
