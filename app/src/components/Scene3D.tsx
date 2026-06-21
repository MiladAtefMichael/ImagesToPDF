import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import type { QueuedImage } from '../hooks/usePDFGenerator';

// Image plane with texture
function ImagePlane({
  position,
  rotation,
  imageUrl,
  scale = 1,
  isUserImage = false,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  imageUrl?: string;
  scale?: number;
  isUserImage?: boolean;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (imageUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(imageUrl, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        setTexture(tex);
      });
    }
  }, [imageUrl]);

  const material = useMemo(() => {
    if (texture) {
      return new THREE.MeshPhysicalMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        roughness: 0.3,
        metalness: 0.05,
        clearcoat: 0.3,
        side: THREE.DoubleSide,
      });
    }
    return new THREE.MeshPhysicalMaterial({
      color: isUserImage ? '#DBEAFE' : '#EFF6FF',
      transparent: true,
      opacity: 0.5,
      roughness: 0.2,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
  }, [texture, isUserImage]);

  return (
    <Float
      speed={isUserImage ? 2 : 1}
      rotationIntensity={isUserImage ? 0.2 : 0.4}
      floatIntensity={isUserImage ? 0.4 : 0.8}
    >
      <mesh position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[1.5, 1, 0.05]} />
        <primitive object={material} attach="material" />
      </mesh>
    </Float>
  );
}

// Gentle camera movement
function CameraController() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    targetRef.current.x += (mouseRef.current.x * 0.2 - targetRef.current.x) * 0.04;
    targetRef.current.y += (mouseRef.current.y * 0.2 - targetRef.current.y) * 0.04;
    camera.rotation.y = targetRef.current.x * 0.06;
    camera.rotation.x = -targetRef.current.y * 0.06;
  });

  return null;
}

// Floating particles
function Particles() {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20 - 5,
        ] as [number, number, number],
        speed: Math.random() * 0.008 + 0.002,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    particles.forEach((particle, i) => {
      const matrix = new THREE.Matrix4();
      const y = particle.position[1] + Math.sin(time * particle.speed + particle.offset) * 0.5;
      const x = particle.position[0] + Math.cos(time * particle.speed * 0.5 + particle.offset) * 0.3;
      matrix.setPosition(x, y, particle.position[2]);
      meshRef.current!.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.025, 6, 6]} />
      <meshBasicMaterial color="#3B82F6" transparent opacity={0.25} />
    </instancedMesh>
  );
}

interface Scene3DProps {
  images: QueuedImage[];
  appState: string;
}

export default function Scene3D({ images, appState }: Scene3DProps) {
  const showUserImages = appState === 'queue' || appState === 'processing';

  const defaultPlanes = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10 - 5,
      ] as [number, number, number],
      rotation: [
        Math.random() * 0.2,
        Math.random() * Math.PI * 2,
        Math.random() * 0.2,
      ] as [number, number, number],
    }));
  }, []);

  const userImagePlanes = useMemo(() => {
    if (!showUserImages || images.length === 0) return [];
    return images.slice(0, 8).map((img, i) => ({
      id: img.id,
      position: [
        ((i % 4) - 1.5) * 3.5,
        (Math.floor(i / 4) - 0.5) * 3,
        -3,
      ] as [number, number, number],
      rotation: [
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.08,
      ] as [number, number, number],
      imageUrl: img.preview,
    }));
  }, [images, showUserImages]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#F0F7FF']} />
        <fog attach="fog" args={['#F0F7FF', 12, 28]} />

        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-10, -5, 5]} intensity={0.4} color="#3B82F6" />
        <pointLight position={[0, 10, -5]} intensity={0.3} color="#10B981" />

        <CameraController />

        {!showUserImages &&
          defaultPlanes.map((plane) => (
            <ImagePlane
              key={plane.id}
              position={plane.position}
              rotation={plane.rotation}
            />
          ))}

        {showUserImages &&
          userImagePlanes.map((plane) => (
            <ImagePlane
              key={plane.id}
              position={plane.position}
              rotation={plane.rotation}
              imageUrl={plane.imageUrl}
              isUserImage
              scale={0.75}
            />
          ))}

        <Particles />
      </Canvas>
    </div>
  );
}
