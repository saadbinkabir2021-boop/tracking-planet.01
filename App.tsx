import React, { useState } from 'react';
import Experience from './components/Experience';
import { UI } from './components/UI';
import { useHandTracking } from './hooks/useHandTracking';
import { PlanetType } from './types';

const App: React.FC = () => {
  // Default to Solar System view
  const [currentType, setCurrentType] = useState<PlanetType>(PlanetType.SOLAR_SYSTEM);
  
  const { videoRef, gestureDataRef, isReady } = useHandTracking();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans selection:bg-blue-500/30">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Experience 
            type={currentType} 
            gestureRef={gestureDataRef}
        />
      </div>

      {/* UI Overlay Layer */}
      <UI 
        currentType={currentType} 
        setType={setCurrentType}
        isTracking={isReady}
      />

      {/* Hidden Webcam Element for MediaPipe */}
      <video
        ref={videoRef}
        className="fixed bottom-4 right-4 w-32 h-24 object-cover rounded-lg border border-white/20 opacity-20 hover:opacity-100 transition-opacity z-50 pointer-events-none"
        autoPlay
        playsInline
        muted
        style={{ transform: 'scaleX(-1)' }}
      />
      
      {/* Loading Indicator */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
         {!isReady && (
            <div className="bg-black/50 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center gap-4 border border-white/10 animate-pulse">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white/80 font-light">Loading Planetary Vision...</span>
            </div>
         )}
      </div>

    </div>
  );
};

export default App;
