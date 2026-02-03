'use client';

import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { Environment, KeyboardControls, Float, Stars, MeshReflectorMaterial } from '@react-three/drei';
import Ecctrl from 'ecctrl';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Suspense, useMemo } from 'react';
import HolographicMaterial from './HolographicMaterial';

// Konfiguracja sterowania
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['Shift'] },
];

function Player() {
  return (
    <Ecctrl debug={false} maxVelLimit={6} jumpVel={5} camInitDis={-4} camMaxDis={-6} camMinDis={-2}>
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.3, 1.2]} />
        <HolographicMaterial
          fresnelAmount={0.4}
          scanlineSize={5}
          signalSpeed={0.5}
          hologramColor="#00ffcc"
          hologramOpacity={0.8}
        />
      </mesh>
    </Ecctrl>
  );
}

function Level() {
  const platforms = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      position: [Math.sin(i) * 15, Math.random() * 4, Math.cos(i * 1.5) * 15] as [number, number, number],
      height: 0.5 + Math.random(),
      color: i % 2 === 0 ? "#ff0066" : "#00ccff"
    }));
  }, []);

  return (
    <>
      {/* Podłoga - Mokry Asfalt (Reflector) */}
      <RigidBody type="fixed" colliders="cuboid" friction={1}>
        <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          {/* @ts-ignore */}
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={80}
            roughness={0.4}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0a0a0a"
            metalness={0.8}
          />
        </mesh>
      </RigidBody>

      {/* Platformy */}
      {platforms.map((p, i) => (
        <RigidBody key={i} type="fixed" position={p.position}>
          <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[3, p.height, 3]} />
              <meshStandardMaterial
                color="#111"
                emissive={p.color}
                emissiveIntensity={3}
              />
            </mesh>
          </Float>
        </RigidBody>
      ))}

      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />
    </>
  );
}

export default function Game() {
  return (
    <div className="w-full h-screen bg-[#050505] overflow-hidden relative">
      <div className="absolute top-5 left-5 z-20 text-white font-mono pointer-events-none select-none">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          GHOST // PROTOCOL
        </h1>
        <p className="text-sm opacity-70">WASD: Move | SPACE: Jump | SHIFT: Sprint</p>
      </div>

      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }} className="w-full h-full">
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 5, 40]} />

        <Suspense fallback={null}>
          <Physics timeStep="vary">
            <KeyboardControls map={keyboardMap}>
              <Player />
            </KeyboardControls>
            <Level />
          </Physics>

          {/* @ts-ignore */}
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.8} radius={0.6} />
            <Noise opacity={0.06} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
