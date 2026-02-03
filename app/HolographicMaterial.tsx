'use client';

import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';

export default function HolographicMaterial({
  fresnelAmount = 0.4,
  scanlineSize = 5,
  signalSpeed = 0.5,
  hologramColor = "#00ffcc",
  hologramOpacity = 0.8,
}: any) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(hologramColor) },
      uOpacity: { value: hologramOpacity },
      uFresnelAmount: { value: fresnelAmount },
      uScanlineSize: { value: scanlineSize },
      uSignalSpeed: { value: signalSpeed },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uFresnelAmount;
      uniform float uScanlineSize;
      uniform float uSignalSpeed;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        // Fresnel effect based on world position and normal
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - max(dot(vNormal, viewDirection), 0.0), uFresnelAmount);

        // Scanlines based on world Y
        float scanline = sin(vWorldPosition.y * uScanlineSize * 10.0 + uTime * uSignalSpeed * 10.0) * 0.5 + 0.5;

        float alpha = uOpacity * (fresnel + scanline * 0.3);
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [fresnelAmount, scanlineSize, signalSpeed, hologramColor, hologramOpacity]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return <shaderMaterial ref={materialRef} args={[shaderArgs]} />;
}
