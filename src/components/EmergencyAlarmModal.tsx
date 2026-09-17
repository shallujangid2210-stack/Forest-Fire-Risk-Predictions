import React from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  MapPin, 
  AlertOctagon, 
  Radio, 
  Navigation,
  Compass,
  CheckCircle2,
  X
} from 'lucide-react';
import { ForestZone, SafetyBeacon } from '../types';

interface EmergencyAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  affectedZoneName: string;
  zones: ForestZone[];
  beacons: SafetyBeacon[];
}

export const EmergencyAlarmModal: React.FC<EmergencyAlarmModalProps> = ({
  isOpen,
  onClose,
  affectedZoneName,
  zones,
  beacons
}) => {
  if (!isOpen) return null;

  const targetZone = zones.find(z => z.name === affectedZoneName) || zones[0];
  const sectorBeacons = beacons.filter(b => b.zone_id === targetZone?.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-red-500 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl shadow-red-950 relative overflow-hidden space-y-5">
        {/* Animated Background Pulse */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 animate-pulse" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-950 text-white animate-bounce">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/50">
                Code Red Evacuation
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-['Outfit',sans-serif]">
                EMERGENCY ALARM ACTIVATED
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Siren Status Indicator */}
        <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-red-300">
            <Volume2 className="w-5 h-5 text-red-400 animate-pulse" />
            <span>Audible Siren Synthesizer Running (Web Audio API)</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-red-500 text-white font-mono font-bold">
            PULSING
          </span>
        </div>

        {/* Affected Zone Card (Required by prompt) */}
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Primary Hazard Sector:</span>
            <span className="font-mono text-red-400 font-bold">Risk Score: {targetZone?.risk_score}/100</span>
          </div>

          <div className="flex items-center space-x-2 text-base sm:text-lg font-extrabold text-white">
            <MapPin className="w-5 h-5 text-red-400 shrink-0" />
            <span>{affectedZoneName}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 block">Temperature</span>
              <strong className="text-white">{targetZone?.temperature}°C</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Humidity</span>
              <strong className="text-white">{targetZone?.humidity}%</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Wind Velocity</span>
              <strong className="text-white">{targetZone?.wind_speed} km/h</strong>
            </div>
          </div>
        </div>

        {/* Sector Offline Beacons Sync Status */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>Offline Solar Beacons in Sector ({sectorBeacons.length || 1} Deployed)</span>
          </span>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 text-slate-300">
            <div className="flex items-center justify-between font-bold text-sky-300">
              <span>Beacon Broadcast:</span>
              <span className="text-red-400">EVACUATION ARROW ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Solar beacon speakers in this zone are actively sounding voice instructions: "EVACUATE NORTH TOWARDS HIGHWAY 120."
            </p>
          </div>
        </div>

        {/* Recommended Safety Guidance */}
        <div className="space-y-1.5 text-xs text-slate-300">
          <span className="font-bold text-white block">Immediate Field Actions:</span>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Backcountry trail gates closed immediately</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Ranger dispatch initiated via digital relay</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Diverting hikers to North Ridge water shelter</span>
            </div>
          </div>
        </div>

        {/* Stop Alarm Button (Required by prompt) */}
        <div className="pt-2">
          <button
            id="stop-alarm-btn"
            onClick={onClose}
            className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-slate-100 text-red-700 font-extrabold text-sm tracking-wide shadow-xl flex items-center justify-center space-x-2 transition active:scale-98"
          >
            <VolumeX className="w-5 h-5 text-red-600" />
            <span>STOP ALARM & SILENCE AUDIBLE SIREN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
