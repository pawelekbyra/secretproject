'use client';

import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { Environment, KeyboardControls, MapControls } from '@react-three/drei';
import Ecctrl from 'ecctrl';
import { Suspense } from 'react';

export default function Game() {
  // Mapa klawiszy dla Ecctrl
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['Shift'] },
  ];

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

          <Physics debug timeStep="vary">
            <KeyboardControls map={keyboardMap}>
              {/* KONTROLER POSTACI (Gracz) */}
              <Ecctrl debug animated={false} camInitDis={-5} camMaxDis={-10}>
                 <mesh castShadow>
                    <capsuleGeometry args={[0.5, 1, 4]} />
                    <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={0.5} />
                 </mesh>
              </Ecctrl>
            </KeyboardControls>

            {/* PODŁOGA */}
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[0, -2, 0]} receiveShadow>
                <boxGeometry args={[100, 1, 100]} />
                <meshStandardMaterial color="#222" roughness={0.1} metalness={0.8} />
              </mesh>
            </RigidBody>

            {/* PRZESZKODY */}
            <RigidBody position={[5, 0, 5]}>
               <mesh castShadow>
                 <boxGeometry args={[2, 2, 2]} />
                 <meshStandardMaterial color="hotpink" />
               </mesh>
            </RigidBody>
          </Physics>
        </Suspense>
      </Canvas>

      <div className="absolute top-0 left-0 p-4 text-white font-mono pointer-events-none">
        <h1 className="text-2xl font-bold">PROJECT GENIE</h1>
        <p>WASD to Move, SPACE to Jump</p>
      </div>
    </div>
  );
}
