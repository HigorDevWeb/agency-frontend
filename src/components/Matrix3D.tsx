"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function AnimatedPoints() {
  const ref = useRef<THREE.Points>(null!);
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05;
      ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Points
      ref={ref}
      positions={particlesPosition}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color="#3b82f6"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

function ConnectedLines() {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const lines = useMemo(() => {
    const linesArray = [];
    for (let i = 0; i < 50; i++) {
      const points = [];
      for (let j = 0; j < 2; j++) {
        points.push(
          new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
          )
        );
      }
      linesArray.push(points);
    }
    return linesArray;
  }, []);

  return (
    <group ref={ref}>
      {lines.map((line, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              args={[new Float32Array(line.flatMap((v) => [v.x, v.y, v.z])), 3]}
              attach="attributes-position"
              count={line.length}
              array={new Float32Array(line.flatMap((v) => [v.x, v.y, v.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
        </line>
      ))}
    </group>
  );
}

export default function Matrix3D() {
  return (
    <div className="absolute inset-0 opacity-20">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <AnimatedPoints />
        <ConnectedLines />
      </Canvas>
    </div>
  );
}
