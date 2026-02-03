'use client';

import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { Environment, MeshReflectorMaterial } from '@react-three/drei';
import Ecctrl from 'ecctrl';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

const Level = () => {
  const cubes = useMemo(() => {
    return new Array(50).fill(0).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 50,
        Math.random() * 5 + 1,
        (Math.random() - 0.5) * 50
      ] as [number, number, number],
      scale: [Math.random() + 0.5, Math.random() + 0.5, Math.random() + 0.5] as [number, number, number],
      color: new THREE.Color().setHSL(Math.random(), 1, 0.5)
    }));
  }, []);

  return (
    <>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={2048}
            mixBlur={1}
            mixStrength={40}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#101010"
            metalness={0.5}
            mirror={0}
          />
        </mesh>
      </RigidBody>

      {cubes.map((cube, i) => (
        <RigidBody key={i} position={cube.position} colliders="cuboid">
          <mesh scale={cube.scale}>
            <boxGeometry />
            <meshStandardMaterial color={cube.color} emissive={cube.color} emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
};

export default function GameScene() {
  return (
    <>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        color: 'white',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        textShadow: '0 0 5px cyan'
      }}>
        <h1 style={{ margin: 0, fontSize: '2em' }}>SECRET PROJECT 3D</h1>
        <p style={{ margin: '5px 0' }}>WASD to Move | SPACE to Jump | Mouse to Look</p>
      </div>

      <Canvas shadows camera={{ position: [0, 5, 10], fov: 65 }}>
        <color attach="background" args={['#050505']} />
        <Suspense fallback={null}>
          <Physics debug={false} timeStep="vary">
            <Environment preset="night" />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

            <Ecctrl debug={false} animated={false} camInitDis={-5} camMaxDis={-10} camMinDis={-2}>
               <mesh castShadow position={[0, 0.5, 0]}>
                 <capsuleGeometry args={[0.5, 1]} />
                 <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={0.5} />
               </mesh>
            </Ecctrl>

            <Level />
          </Physics>

          <EffectComposer>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </>
  );
}
