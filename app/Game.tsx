'use client';

import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import { Environment, KeyboardControls, Float, Stars, MeshReflectorMaterial } from '@react-three/drei';
import Ecctrl from 'ecctrl';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Suspense, useMemo, useState, useCallback, useRef } from 'react';
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

function DataFragment({ position, onCollect }: { position: [number, number, number], onCollect: () => void }) {
  const [collected, setCollected] = useState(false);

  const handleIntersection = useCallback(() => {
    if (!collected) {
      setCollected(true);
      onCollect();
    }
  }, [collected, onCollect]);

  if (collected) return null;

  return (
    <RigidBody
      type="fixed"
      position={position}
      sensor
      onIntersectionEnter={handleIntersection}
    >
      <Float speed={4} rotationIntensity={2} floatIntensity={1}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.3, 0]} />
          <HolographicMaterial
            fresnelAmount={0.5}
            scanlineSize={10}
            signalSpeed={1}
            hologramColor="#00ccff"
            hologramOpacity={0.7}
          />
        </mesh>
      </Float>
    </RigidBody>
  );
}

function Player() {
  return (
    <Ecctrl
      debug={false}
      maxVelLimit={6}
      jumpVel={5}
      camInitDis={5}
      camMaxDis={8}
      camMinDis={2}
      position={[0, 2, 0]}
    >
      <mesh castShadow>
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

function Level({ onCollect }: { onCollect: () => void }) {
  const platforms = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      position: [i * 6, i * 1.5, Math.sin(i) * 4] as [number, number, number],
      height: 0.5,
      color: i % 2 === 0 ? "#ff0066" : "#00ccff"
    }));
  }, []);

  return (
    <>
      {/* Podłoga - Mokry Asfalt (Reflector) */}
      <RigidBody type="fixed" colliders="cuboid" friction={1}>
        <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
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

      {/* Platformy i Fragmenty */}
      {platforms.map((p, i) => (
        <group key={i}>
          <RigidBody type="fixed" position={p.position}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[4, p.height, 4]} />
              <meshStandardMaterial
                color="#111"
                emissive={p.color}
                emissiveIntensity={5}
              />
            </mesh>
          </RigidBody>
          <DataFragment
            position={[p.position[0], p.position[1] + 1.5, p.position[2]]}
            onCollect={onCollect}
          />
        </group>
      ))}

      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />
    </>
  );
}

export default function Game() {
  const [score, setScore] = useState(0);
  const [playerKey, setPlayerKey] = useState(0);

  const handleCollect = useCallback(() => {
    setScore(s => s + 1);
  }, []);

  const handleKill = useCallback(() => {
    setPlayerKey(k => k + 1);
  }, []);

  const isWon = score >= 10;

  return (
    <div className="w-full h-screen bg-[#050505] overflow-hidden relative">
      {/* UI Overlay */}
      <div className="absolute top-5 left-5 z-20 text-white font-mono pointer-events-none select-none">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          GHOST // PROTOCOL
        </h1>
        <div className="mt-2 flex items-center gap-4">
          <div className="px-3 py-1 bg-cyan-900/50 border border-cyan-400/50 rounded text-cyan-400 font-bold">
            DATA_RETRIEVED: {score} / 10
          </div>
        </div>
        <p className="text-xs mt-2 opacity-50">WASD: MOVE | SPACE: JUMP | SHIFT: SPRINT</p>
      </div>

      {/* Win Screen */}
      {isWon && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-700">
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 tracking-tighter">
            MISSION ACCOMPLISHED
          </h2>
          <p className="text-cyan-400 mt-4 font-mono animate-pulse text-lg">
            PROTOCOL SECURED // ALL FRAGMENTS COLLECTED
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-12 px-8 py-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all font-bold font-mono uppercase tracking-widest"
          >
            Restart_System
          </button>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }} className="w-full h-full">
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 5, 60]} />

        <Suspense fallback={null}>
          <Physics timeStep="vary">
            <KeyboardControls map={keyboardMap}>
              <Player key={playerKey} />
            </KeyboardControls>

            <Level onCollect={handleCollect} />

            {/* Kill Zone Sensor */}
            <RigidBody
              type="fixed"
              sensor
              position={[0, -5, 0]}
              onIntersectionEnter={handleKill}
            >
              <CuboidCollider args={[1000, 0.1, 1000]} />
            </RigidBody>
          </Physics>

          {/* @ts-ignore */}
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={2.5} radius={0.7} />
            <Noise opacity={0.08} />
            <Vignette eskil={false} offset={0.1} darkness={1.2} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
