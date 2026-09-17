import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  MapPin, 
  Clock, 
  Sparkles, 
  Info,
  Zap,
  RotateCw
} from 'lucide-react';
import { AnimalMovement, ForestZone } from '../types';
import { TrendChart } from './TrendChart';

interface AnimalMonitoringProps {
  animals: AnimalMovement[];
  zones: ForestZone[];
  onNavigateToMap: () => void;
}

export const AnimalMonitoring: React.FC<AnimalMonitoringProps> = ({
  animals,
  zones,
  onNavigateToMap
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [simulatedSurge, setSimulatedSurge] = useState<boolean>(false);

  const unusualCount = animals.filter(a => a.is_unusual).length;

  const filteredAnimals = animals.filter(a => {
    if (filter === 'Unusual') return a.is_unusual;
    if (filter === 'Normal') return !a.is_unusual;
    return true;
  });

  // Chart data comparing tracked herd speed vs normal baseline
  const chartLabels = animals.map(a => a.species.split(' ')[0]);
  const currentSpeeds = animals.map(a => a.speed_kmh);
  const baselineSpeeds = animals.map(a => a.baseline_speed);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit',sans-serif]">
              Animal Movement & Bio-Sensor Early Warning
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracking wildlife panic vectors and flight velocity surges as an organic pre-smoke early warning indicator.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1.5 ${
            unusualCount > 0
              ? 'bg-rose-950/70 text-rose-300 border-rose-500/40 animate-pulse'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{unusualCount} Unusual Flight Anomalies Detected</span>
          </span>
        </div>
      </div>

      {/* Explainer / Hackathon Bio-Telemetry Concept Banner */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-950 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Why Animal Movement Matters in Wildfire Early Warning</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-mono">
                Simulated Bio-Telemetry
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Animals possess sensory acuity for thermal drafts, infrasound vibrations, and volatile organic pyrolyzates up to 30 minutes before satellite optical thermal hotspots register. Sudden displacement away from a sector acts as a biological alert.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToMap}
          className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold whitespace-nowrap transition"
        >
          View on Risk Map
        </button>
      </div>

      {/* Velocity Comparison Chart (Chart.js) */}
      <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white font-['Outfit',sans-serif]">
              Tracked Herd Velocity vs. Historical Baseline (km/h)
            </h3>
            <p className="text-xs text-slate-400">
              Red markers exceeding baseline by &gt;2.5x represent panic flight surges.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
            Chart.js Velocity Matrix
          </span>
        </div>

        <div className="h-60 w-full">
          <TrendChart
            labels={chartLabels}
            datasets={[
              {
                label: 'Current Movement Speed (km/h)',
                data: currentSpeeds,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                fill: true,
              },
              {
                label: 'Normal Baseline Speed (km/h)',
                data: baselineSpeeds,
                borderColor: '#22c55e',
                backgroundColor: 'transparent',
              }
            ]}
            yAxisLabel="Speed (km/h)"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter:</span>
        {['All', 'Unusual', 'Normal'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              filter === t
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t} ({t === 'All' ? animals.length : t === 'Unusual' ? unusualCount : animals.length - unusualCount})
          </button>
        ))}
      </div>

      {/* Animal Tracking Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnimals.map((animal) => {
          const isUnusual = animal.is_unusual;

          return (
            <div
              key={animal.id}
              className={`rounded-2xl p-5 border shadow-xl transition-all flex flex-col justify-between ${
                isUnusual
                  ? 'bg-slate-900/90 border-red-500/50 hover:border-red-400'
                  : 'bg-slate-900/90 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                      ID: {animal.id}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 font-['Outfit',sans-serif]">
                      {animal.species}
                    </h3>
                  </div>

                  {/* Movement Status Badge (Required by prompt: Normal vs Unusual) */}
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                    isUnusual
                      ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  }`}>
                    {animal.movement_status}
                  </span>
                </div>

                {/* Zone & Timestamp (Required by prompt) */}
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sector: <strong className="text-white">{animal.zone_name}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Timestamp: {animal.timestamp}</span>
                  </div>
                </div>

                {/* Telemetry Metrics: Velocity vs Baseline */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Velocity</span>
                    <span className={`text-base font-bold ${isUnusual ? 'text-red-400 font-extrabold' : 'text-white'}`}>
                      {animal.speed_kmh} km/h
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Baseline Normal</span>
                    <span className="text-sm font-semibold text-slate-300">
                      {animal.baseline_speed} km/h
                    </span>
                  </div>
                </div>

                {/* Direction & Vector */}
                <div className="text-xs text-slate-300 flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Vector: {animal.direction}</span>
                </div>

                {/* Anomaly Signal Warning (Required by prompt) */}
                {isUnusual ? (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Warning Signal Engaged</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-rose-300/90">
                      {animal.threat_indicator}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Natural foraging; zero distress detected.</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400 italic">
                "{animal.notes}"
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
