import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlanetType, HandGestureData } from '../types';
import { generateParticles } from '../utils/shapes';

interface ParticlesProps {
  type: PlanetType;
  gestureRef: React.MutableRefObject<HandGestureData>;
  lightPosition: THREE.Vector3;
}

const PARTICLE_COUNT = 8000;

const Particles: React.FC<ParticlesProps> = ({ type, gestureRef, lightPosition }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Initial state
  const initialData = useMemo(() => generateParticles(type), []);

  // Target state
  const targetData = useMemo(() => generateParticles(type), [type]);

  // Pre-calculate light vector for directional approximation (normalized)
  const lightDir = useMemo(() => {
     return lightPosition.clone().normalize();
  }, [lightPosition]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const gesture = gestureRef.current;
    const geometry = pointsRef.current.geometry;
    
    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
    const posArray = positionAttribute.array as Float32Array;

    const colorAttribute = geometry.attributes.color as THREE.BufferAttribute;
    const colArray = colorAttribute.array as Float32Array;

    // Interaction Parameters
    let scaleFactor = 1;
    let turbulence = 0;
    
    if (gesture.isActive) {
        // Hand Distance controls Scale/Explosion effect
        scaleFactor = 0.5 + (gesture.distance * 2.0); 
        turbulence = (1 - gesture.distance) * 0.1; 
    } else {
        // Idle breathing
        const time = state.clock.getElapsedTime();
        scaleFactor = 1 + Math.sin(time * 0.5) * 0.05;
    }

    const isSun = type === PlanetType.SUN;
    const isSolarSystem = type === PlanetType.SOLAR_SYSTEM;

    // Update particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // --- POSITION MORPHING ---
      const tx = targetData.positions[i3];
      const ty = targetData.positions[i3 + 1];
      const tz = targetData.positions[i3 + 2];

      let cx = posArray[i3];
      let cy = posArray[i3 + 1];
      let cz = posArray[i3 + 2];

      const morphSpeed = delta * 4;
      
      // Apply Scale to Target
      const targetScaledX = tx * scaleFactor;
      const targetScaledY = ty * scaleFactor;
      const targetScaledZ = tz * scaleFactor;

      const noise = gesture.isActive ? (Math.random() - 0.5) * turbulence : 0;
      
      // Move
      posArray[i3] += (targetScaledX - cx) * morphSpeed + noise;
      posArray[i3 + 1] += (targetScaledY - cy) * morphSpeed + noise;
      posArray[i3 + 2] += (targetScaledZ - cz) * morphSpeed + noise;

      // Update current position vars for lighting calc
      cx = posArray[i3];
      cy = posArray[i3 + 1];
      cz = posArray[i3 + 2];

      // --- COLOR MORPHING & LIGHTING ---
      const tcr = targetData.colors[i3];
      const tcg = targetData.colors[i3 + 1];
      const tcb = targetData.colors[i3 + 2];

      let intensity = 1.0;

      if (isSun) {
          intensity = 1.2; // Sun glows
      } else if (isSolarSystem) {
          if (i < 1000) intensity = 1.5; // Sun center glows
          // Orbits stay flat lit
      } else {
          // Planet Lighting Simulation
          // Assume planet center is at 0,0,0
          // Normal is approximately vector from center to particle
          // Since we might be scaled, we normalize the current position
          // Optimization: Approximate Normal with target position (smoother) or current (dynamic)
          // Using current position for normal creates dynamic shadows as it expands/contracts
          
          const distSq = cx*cx + cy*cy + cz*cz;
          if (distSq > 0.001) {
              const invDist = 1.0 / Math.sqrt(distSq);
              const nx = cx * invDist;
              const ny = cy * invDist;
              const nz = cz * invDist;

              // Dot Product with Light Direction
              const dot = nx * lightDir.x + ny * lightDir.y + nz * lightDir.z;
              
              // Lambertian diffuse + Ambient
              // Ambient 0.2, Diffuse 0.8
              intensity = 0.2 + 0.8 * Math.max(dot, 0);

              // Add specular highlight?
              if (intensity > 0.95 && !isSolarSystem) {
                 intensity += 0.5; // Shiny spot
              }
          }
      }
      
      // Target color with lighting applied
      const finalR = tcr * intensity;
      const finalG = tcg * intensity;
      const finalB = tcb * intensity;

      colArray[i3] += (finalR - colArray[i3]) * morphSpeed;
      colArray[i3 + 1] += (finalG - colArray[i3 + 1]) * morphSpeed;
      colArray[i3 + 2] += (finalB - colArray[i3 + 2]) * morphSpeed;
    }

    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
    
    // Global Rotation
    if (pointsRef.current) {
        const rotSpeed = isSolarSystem ? 0.05 : 0.1;
        pointsRef.current.rotation.y += delta * rotSpeed;
        
        if (gesture.isActive) {
             const targetRotX = gesture.center[1] * 0.5;
             const targetRotZ = -gesture.center[0] * 0.5;
             pointsRef.current.rotation.x += (targetRotX - pointsRef.current.rotation.x) * delta * 2;
             pointsRef.current.rotation.z += (targetRotZ - pointsRef.current.rotation.z) * delta * 2;
        } else {
             pointsRef.current.rotation.x += (0 - pointsRef.current.rotation.x) * delta;
             pointsRef.current.rotation.z += (0 - pointsRef.current.rotation.z) * delta;
        }
    }
  });

  // Texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={initialData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={initialData.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        map={texture}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={true}
      />
    </points>
  );
};

export default Particles;
