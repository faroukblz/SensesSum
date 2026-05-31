"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════
   Layered Geometric Ring – React Three Fiber
   
   Renders the abstract layered ring/semicircle structure
   anchored to the lower-right viewport, matching the
   reference design mockup exactly.
   
   States:
   • idle        → slow pulsing rotation
   • processing  → rapid particle spin track
   • done        → gentle color morph + ease back
   ═══════════════════════════════════════════════════ */

// ── Individual Ring Layer ──────────────────────────

function RingLayer({ radius, tubeRadius, arc, rotation, color, opacity, speed, state }) {
  const meshRef = useRef();

  // Create a partial torus (arc segment)
  const geometry = useMemo(
    () => new THREE.TorusGeometry(radius, tubeRadius, 32, 100, arc),
    [radius, tubeRadius, arc]
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const baseSpeed = state === "processing" ? speed * 6 : speed;
    meshRef.current.rotation.z += delta * baseSpeed;

    // Gentle floating pulse
    const time = meshRef.current.rotation.z * 0.3;
    const pulse = state === "processing" ? 0 : Math.sin(time) * 0.02;
    meshRef.current.scale.setScalar(1 + pulse);
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={rotation}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

// ── Tick Marks (the ruler-like lines on the ring) ──

function TickMarks({ radius, count, state }) {
  const groupRef = useRef();

  const ticks = useMemo(() => {
    const items = [];
    const arcSpan = Math.PI * 0.6;
    const startAngle = -Math.PI * 0.1;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + (i / (count - 1)) * arcSpan;
      const isLong = i % 5 === 0;
      const len = isLong ? 0.35 : 0.18;
      const x1 = Math.cos(angle) * radius;
      const y1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle) * (radius + len);
      const y2 = Math.sin(angle) * (radius + len);

      items.push({ x1, y1, x2, y2, isLong, angle });
    }
    return items;
  }, [radius, count]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = state === "processing" ? 0.6 : 0.08;
    groupRef.current.rotation.z += delta * speed;
  });

  return (
    <group ref={groupRef}>
      {ticks.map((tick, i) => {
        const dx = tick.x2 - tick.x1;
        const dy = tick.y2 - tick.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const mx = (tick.x1 + tick.x2) / 2;
        const my = (tick.y1 + tick.y2) / 2;

        return (
          <mesh key={i} position={[mx, my, 0]} rotation={[0, 0, tick.angle + Math.PI / 2]}>
            <boxGeometry args={[0.02, len, 0.01]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={tick.isLong ? 0.7 : 0.35}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Particle Track (visible during processing) ────

function ParticleTrack({ radius, state }) {
  const pointsRef = useRef();
  const count = 120;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = Math.sin(angle) * radius;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    return arr;
  }, [radius, count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.z += delta * 2.5;
  });

  if (state !== "processing") return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#6c5ce7" size={0.04} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// ── Glow Ring (subtle outer glow) ─────────────────

function GlowRing({ state }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z -= delta * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[3.4, 0.02, 16, 100]} />
      <meshBasicMaterial
        color={state === "done" ? "#a29bfe" : "#c5baf2"}
        transparent
        opacity={0.25}
      />
    </mesh>
  );
}

// ── Main Scene Composition ────────────────────────

function RingScene({ state = "idle" }) {
  return (
    <group position={[1.2, -1.0, 0]} rotation={[0.15, -0.1, -0.2]}>
      {/* Outermost ring – wide, semi-transparent */}
      <RingLayer
        radius={3.0}
        tubeRadius={0.06}
        arc={Math.PI * 1.4}
        rotation={[Math.PI / 2, 0, 0.3]}
        color="#d4ccf0"
        opacity={0.3}
        speed={0.08}
        state={state}
      />

      {/* Middle ring – medium, lavender fill */}
      <RingLayer
        radius={2.6}
        tubeRadius={0.15}
        arc={Math.PI * 1.2}
        rotation={[Math.PI / 2, 0, -0.2]}
        color="#e0d7ff"
        opacity={0.5}
        speed={0.12}
        state={state}
      />

      {/* Inner ring – solid periwinkle accent */}
      <RingLayer
        radius={2.2}
        tubeRadius={0.08}
        arc={Math.PI * 1.0}
        rotation={[Math.PI / 2, 0, 0.5]}
        color="#c5baf2"
        opacity={0.6}
        speed={0.15}
        state={state}
      />

      {/* Tick marks on the outer ring */}
      <TickMarks radius={2.95} count={30} state={state} />

      {/* Particle spin track – only during processing */}
      <ParticleTrack radius={2.8} state={state} />

      {/* Outer glow */}
      <GlowRing state={state} />
    </group>
  );
}

// ── Exported Canvas Component ─────────────────────

export default function Ring3D({ state = "idle" }) {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <pointLight position={[-3, -3, 3]} intensity={0.4} color="#a29bfe" />
        <RingScene state={state} />
      </Canvas>
    </div>
  );
}
