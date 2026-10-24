import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { live } from '@/lib/scenes';

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const accentInto = (color, k = 1) =>
  color.setRGB((live.acR / 255) * k, (live.acG / 255) * k, (live.acB / 255) * k, THREE.SRGBColorSpace);

/**
 * The hero object. Scroll progress drives its position, rotation and scale,
 * and its colour is the live accent of whichever scene the reader is in.
 */
function Hero() {
  const group = useRef();
  const mat = useRef();
  const ring = useRef();
  const orbit = useRef();
  const light = useRef();

  useFrame(({ viewport, clock }, delta) => {
    const p = live.progress;
    const w = viewport.width;
    const narrow = w < 6;
    const amp = narrow ? 0.12 : 0.27;
    const t = clock.elapsedTime;

    const tx = Math.cos(p * Math.PI * 4) * w * amp + (narrow ? 0 : w * 0.04);
    const ty = Math.sin(p * Math.PI * 6) * 0.6 + (narrow ? 1.2 : 0);
    const ts = (narrow ? 0.62 : 0.85) * (1 + 0.28 * Math.sin(p * Math.PI * 8));

    const g = group.current;
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 3.2, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, ty, 3.2, delta);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, ts, 3.2, delta));
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, p * Math.PI * 5, 2.5, delta);
    g.rotation.y += reduced ? 0 : delta * 0.25;

    ring.current.rotation.z = t * 0.2;
    orbit.current.rotation.y = t * 0.55;

    accentInto(mat.current.color);
    accentInto(mat.current.emissive, 0.22);
    accentInto(light.current.color);
    mat.current.distort = 0.28 + 0.14 * Math.sin(t * 0.8 + p * 6);
  });

  return (
    <group ref={group}>
      <mesh>
        <torusKnotGeometry args={[1, 0.34, 240, 36]} />
        <MeshDistortMaterial ref={mat} speed={reduced ? 0 : 1.6} roughness={0.18} metalness={0.35} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.95, 0.012, 16, 160]} />
        <meshBasicMaterial color="white" transparent opacity={0.35} />
      </mesh>
      <group ref={orbit}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 3) * 2.4, 0.3 * (i - 1), Math.sin((i * Math.PI * 2) / 3) * 2.4]}>
            <sphereGeometry args={[0.09 + i * 0.03, 24, 24]} />
            <meshBasicMaterial color="white" />
          </mesh>
        ))}
      </group>
      <pointLight ref={light} position={[-2.5, 1.5, 3]} intensity={38} distance={14} />
    </group>
  );
}

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

export default function Scene() {
  const ok = useMemo(hasWebGL, []);
  if (!ok) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 6.5], fov: 40 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 3]} intensity={2.2} />
        <Hero />
        <Sparkles count={70} scale={[14, 9, 6]} size={2.4} speed={0.3} opacity={0.5} color="white" />
      </Canvas>
    </div>
  );
}
