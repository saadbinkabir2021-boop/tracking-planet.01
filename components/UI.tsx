import React from 'react';
import { PlanetType } from '../types';
import { PLANET_INFO } from '../utils/planetData';
import { Circle, Database, Thermometer, Clock, Calendar, Moon } from 'lucide-react';

interface UIProps {
  currentType: PlanetType;
  setType: (s: PlanetType) => void;
  isTracking: boolean;
}

export const UI: React.FC<UIProps> = ({ 
  currentType, 
  setType, 
  isTracking
}) => {
  const info = PLANET_INFO[currentType];

  return (
    <>
      {/* Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none select-none">
        <h1 className="text-4xl font-thin text-white tracking-tighter drop-shadow-2xl">
          Saad's <span className="font-bold text-blue-400">Tracking Planet</span>
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-white/70 uppercase tracking-widest font-semibold">
            {isTracking ? 'Hand Tracking Active' : 'Initializing AI Vision...'}
          </span>
        </div>
      </div>

      {/* Planet Details Card */}
      <div className="absolute top-24 left-6 z-10 w-80 pointer-events-none">
         <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-1">{info.name}</h2>
            <div className="text-xs text-blue-300 uppercase tracking-wider mb-4 font-semibold">{info.stats.type}</div>
            
            <p className="text-white/80 text-sm leading-relaxed mb-6">
                {info.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                        <Clock size={12} /> Day Length
                    </div>
                    <span className="text-white font-mono text-sm">{info.stats.dayLength}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                        <Calendar size={12} /> Year Length
                    </div>
                    <span className="text-white font-mono text-sm">{info.stats.yearLength}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                        <Thermometer size={12} /> Avg Temp
                    </div>
                    <span className="text-white font-mono text-sm">{info.stats.avgTemp}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                        <Moon size={12} /> Moons
                    </div>
                    <span className="text-white font-mono text-sm">{info.stats.moons}</span>
                </div>
            </div>
         </div>
      </div>

      {/* Top Right: Interaction Tips */}
      <div className="absolute top-6 right-6 z-10 max-w-xs text-right hidden md:block pointer-events-none">
         <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/5">
             <p className="text-white/60 text-xs font-mono uppercase mb-2">Gesture Control</p>
             <ul className="text-white/90 text-sm font-light space-y-1">
               <li>👐 <span className="font-semibold">Apart:</span> Expand / Zoom In</li>
               <li>👏 <span className="font-semibold">Together:</span> Compress / Zoom Out</li>
               <li>👆 <span className="font-semibold">Move:</span> Rotate View</li>
             </ul>
         </div>
      </div>

      {/* Bottom Planet Selector */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col justify-end items-center gap-4 px-6 pointer-events-none">
        <div className="pointer-events-auto max-w-4xl w-full bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max px-2">
            {Object.values(PlanetType).map((type) => {
              const isActive = currentType === type;
              return (
                <button
                  key={type}
                  onClick={() => setType(type)}
                  className={`relative px-4 py-3 rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2
                    ${isActive ? 'bg-white/20 text-white shadow-lg' : 'text-white/50 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  <Circle size={isActive ? 16 : 12} fill={isActive ? "currentColor" : "none"} />
                  <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{type}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};