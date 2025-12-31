import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Particles from './Particles';
import { PlanetType, HandGestureData } from '../types';
import * as THREE from 'three';

interface ExperienceProps {
  type: PlanetType;
  gestureRef: React.MutableRefObject<HandGestureData>;
}

const Experience: React.FC<ExperienceProps> = ({ type, gestureRef }) => {
  // Determine light position based on view type
  const lightPosition = useMemo(() => {
     if (type === PlanetType.SOLAR_SYSTEM) return new THREE.Vector3(0, 0, 0);
     if (type === PlanetType.SUN) return new THREE.Vector3(0, 0, 0); // Sun is the light
     return new THREE.Vector3(20, 10, 20); // Dynamic side lighting for planets
  }, [type]);

  return (
    <div className="w-full h-full bg-slate-900">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#000000']} />
        
        <fog attach="fog" args={['#000000', 8, 30]} />
        
        {/* Dynamic Light Source */}
        <pointLight 
            position={lightPosition} 
            intensity={1.5} 
            color="#ffffff" 
            decay={0} // No decay for space sunlight feel
        />
        {/* Ambient for base visibility */}
        <ambientLight intensity={0.2} />

        <Suspense fallback={null}>
          <Particles type={type} gestureRef={gestureRef} lightPosition={lightPosition} />
        </Suspense>

        <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            maxDistance={25} 
            minDistance={2}
            autoRotate={!gestureRef.current.isActive}
            autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default Experience;
