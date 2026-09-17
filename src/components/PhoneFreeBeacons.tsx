import React, { useState } from 'react';
import { 
  Radio, 
  Sun, 
  BatteryCharging, 
  AlertOctagon, 
  Volume2, 
  Navigation, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Info,
  Terminal,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { SafetyBeacon } from '../types';
import { playBeaconChime } from '../utils/audio';

interface PhoneFreeBeaconsProps {
  beacons: SafetyBeacon[];
  onToggleBeacon: (beaconId: string) => void;
}

export const PhoneFreeBeacons: React.FC<PhoneFreeBeaconsProps> = ({
  beacons,
  onToggleBeacon
}) => {
  const [activeTestId, setActiveTestId] = useState<string | null>(null);

  const handleTestBeacon = (beaconId: string) => {
    setActiveTestId(beaconId);
    playBeaconChime();
    onToggleBeacon(beaconId);
    setTimeout(() => setActiveTestId(null), 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit',sans-serif]">
              Phone-Free Forest Safety: Solar Autonomous Beacons
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Offline solar-powered life-safety units guiding hikers and campers without cellular reception or smartphones.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-sky-950 text-sky-300 border border-sky-500/30 text-xs font-mono font-semibold">
          Hardware Mesh: LoRa 915 MHz (Simulated)
        </span>
      </div>

      {/* Hardware Prototype Disclaimer (Required by prompt) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-sky-950 flex items-center justify-center border border-sky-500/40 shrink-0">
            <Sun className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>Backcountry Offline Survivability Concept</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                Simulated Hackathon Prototype
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Over 85% of wilderness trails lack 4G/5G mobile connectivity. ForestGuard solar beacons remain 100% autonomous with high-intensity LED directional strobes and solar-recharged audio speakers.
            </p>
          </div>
        </div>
      </div>

      {/* Beacon Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {beacons.map((beacon) => {
          const isAlarm = beacon.status === 'Alarm Activated';
          const isWarning = beacon.status === 'Active Warning';

          return (
            <div
              key={beacon.id}
              className={`rounded-2xl p-5 border shadow-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                isAlarm
                  ? 'bg-slate-900/95 border-red-500/60 ring-1 ring-red-500/30'
                  : isWarning
                  ? 'bg-slate-900/95 border-orange-500/50'
                  : 'bg-slate-900/95 border-slate-700/70'
              }`}
            >
              {/* Pulsing Strobe Indicator if Alarm is active */}
              {isAlarm && (
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-red-500 animate-pulse" />
              )}

              <div className="space-y-4">
                {/* Header: Beacon ID, Location, Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                        {beacon.id}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Navigation className="w-3 h-3 text-slate-500" />
                        <span>{beacon.lat.toFixed(4)}, {beacon.lng.toFixed(4)}</span>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5 font-['Outfit',sans-serif]">
                      {beacon.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Location: {beacon.location}
                    </p>
                  </div>

                  {/* Status & Risk Pill */}
                  <div className="text-right space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                      isAlarm ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                      isWarning ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    }`}>
                      {beacon.status}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Risk: <strong className="text-slate-200">{beacon.risk_level}</strong>
                    </div>
                  </div>
                </div>

                {/* Hardware Telemetry Bar: Solar & Battery */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <BatteryCharging className="w-4 h-4 text-emerald-400" />
                    <span>Battery: <strong>{beacon.battery_pct}%</strong> (LiFePO4)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Solar Input: <strong>{beacon.solar_input_w} W</strong></span>
                  </div>
                </div>

                {/* High Risk / Alarm Activated Section (Required by prompt) */}
                {(isAlarm || isWarning) && (
                  <div className="space-y-3 p-4 rounded-xl bg-red-950/40 border border-red-500/40 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-extrabold text-red-400">
                      <span className="flex items-center space-x-1.5">
                        <AlertOctagon className="w-4 h-4 animate-bounce" />
                        <span>HARDWARE ALARM BROADCAST ENGAGED</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-500 text-white font-mono">
                        STRIKE ACTIVE
                      </span>
                    </div>

                    {/* Direction / Safety Message (Required by prompt) */}
                    <div className="p-3 rounded-lg bg-red-900/60 border border-red-400/30 text-white font-mono font-bold text-xs tracking-wider flex items-center space-x-2">
                      <Compass className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>{beacon.direction_message}</span>
                    </div>

                    {/* Step-by-Step Evacuation Guidance (Required by prompt) */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Offline Physical Trail Instructions:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-200">
                        {beacon.guidance_steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start space-x-2">
                            <span className="w-4 h-4 rounded-full bg-red-500/30 text-red-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Normal Standby State */}
                {!isAlarm && !isWarning && (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Beacon operating on passive watch. Solar array fully charged. Directional arrows ready.</span>
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="pt-4 mt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  Ping: {beacon.last_ping}
                </span>

                <button
                  onClick={() => handleTestBeacon(beacon.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow ${
                    isAlarm
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      : 'bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-500/40'
                  }`}
                >
                  <Volume2 className={`w-3.5 h-3.5 ${activeTestId === beacon.id ? 'animate-spin' : ''}`} />
                  <span>{isAlarm ? 'Reset to Standby' : 'Test Beacon Alarm'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated LoRa Radio Mesh Packet Terminal */}
      <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Offline LoRa Mesh Network Live Console (Simulated)</span>
          </div>
          <span className="text-[10px] text-emerald-400 animate-pulse">Mesh Link: 100% Reliable</span>
        </div>

        <div className="space-y-1 text-[11px] text-slate-400 pt-1">
          <p><span className="text-slate-600">[08:29:45]</span> <span className="text-sky-400">BCN-101:</span> SOLAR_IN=28.5W &bull; BATT=98% &bull; CMD=ALARM_EVAC_BROADCAST &bull; STROBE=ON</p>
          <p><span className="text-slate-600">[08:29:32]</span> <span className="text-sky-400">BCN-102:</span> SOLAR_IN=26.0W &bull; BATT=94% &bull; CMD=WARN_DOWNVALLEY &bull; STROBE=ON</p>
          <p><span className="text-slate-600">[08:29:10]</span> <span className="text-sky-400">BCN-103:</span> SOLAR_IN=31.0W &bull; BATT=100% &bull; CMD=STANDBY_MONITOR</p>
          <p><span className="text-slate-600">[08:28:55]</span> <span className="text-sky-400">BCN-104:</span> SOLAR_IN=25.2W &bull; BATT=91% &bull; CMD=WARN_WEST_GATE_EXIT</p>
        </div>
      </div>
    </div>
  );
};
