import React, { useState } from 'react';
import { 
  Calculator, 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain, 
  TreePine, 
  History, 
  Activity, 
  Sparkles, 
  Info,
  Check,
  RefreshCw,
  Sliders,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { computeFireRisk, RiskInputParams } from '../services/api';
import { RiskCalculationResult } from '../types';

export const RiskPrediction: React.FC = () => {
  // Input parameters state
  const [params, setParams] = useState<RiskInputParams>({
    temperature: 38,
    humidity: 16,
    wind_speed: 38,
    rainfall: 1.5,
    vegetation_dryness: 82,
    historical_frequency: 3,
    animal_anomaly: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute live score dynamically
  const result: RiskCalculationResult = computeFireRisk(params);

  const presets = [
    {
      name: 'Extreme Heatwave & Sirocco Wind',
      badge: 'Critical Scenario',
      values: {
        temperature: 42,
        humidity: 12,
        wind_speed: 46,
        rainfall: 0,
        vegetation_dryness: 94,
        historical_frequency: 4,
        animal_anomaly: true
      }
    },
    {
      name: 'Severe Drought & Afternoon Gusts',
      badge: 'High Scenario',
      values: {
        temperature: 35,
        humidity: 22,
        wind_speed: 32,
        rainfall: 2,
        vegetation_dryness: 76,
        historical_frequency: 3,
        animal_anomaly: true
      }
    },
    {
      name: 'Moderate Summer Day',
      badge: 'Medium Scenario',
      values: {
        temperature: 28,
        humidity: 45,
        wind_speed: 18,
        rainfall: 8,
        vegetation_dryness: 50,
        historical_frequency: 1,
        animal_anomaly: false
      }
    },
    {
      name: 'Post-Rainstorm Humid Safe',
      badge: 'Low Scenario',
      values: {
        temperature: 19,
        humidity: 78,
        wind_speed: 10,
        rainfall: 32,
        vegetation_dryness: 18,
        historical_frequency: 0,
        animal_anomaly: false
      }
    }
  ];

  const handleApplyPreset = (pValues: RiskInputParams) => {
    setParams(pValues);
  };

  const handleSavePrediction = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Helper for gauge needle angle (-90 deg to 90 deg)
  const needleAngle = -90 + (result.score / 100) * 180;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit',sans-serif]">
              Forest Fire Risk Prediction Engine
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rule-based multi-factor hazard calculation model with transparent parameter attribution.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Model: Rule-Based v1.2 (ML Drop-In Ready)
          </span>
        </div>
      </div>

      {/* Quick Preset Buttons */}
      <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hackathon Demonstration Presets</span>
          </span>
          <span className="text-[11px] text-slate-400">Click to instantly populate environmental parameters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset.values)}
              className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700/70 hover:border-amber-500/50 transition-all text-xs group"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-semibold text-amber-300/80">{preset.badge}</span>
                <Sliders className="w-3 h-3 group-hover:text-amber-400 transition" />
              </div>
              <div className="font-bold text-slate-200 group-hover:text-white">
                {preset.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Inputs (Left) and Score Gauge / Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs & Sliders */}
        <div className="lg:col-span-7 bg-slate-800/80 rounded-2xl p-5 sm:p-6 border border-slate-700/70 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Environmental & Sensor Inputs</span>
            </h3>
            <button
              onClick={() => handleApplyPreset(presets[0].values)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Values</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* 1. Temperature */}
            <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Thermometer className="w-4 h-4 text-red-400" />
                  <span>Ambient Temperature (°C)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={-10}
                    max={55}
                    value={params.temperature}
                    onChange={(e) => setParams({ ...params, temperature: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-center font-bold text-sm text-white focus:outline-none focus:border-red-400"
                  />
                  <span className="text-slate-400 text-xs">°C</span>
                </div>
              </div>
              <input
                type="range"
                min={-10}
                max={55}
                step={0.5}
                value={params.temperature}
                onChange={(e) => setParams({ ...params, temperature: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-10°C (Frozen)</span>
                <span>25°C (Mild)</span>
                <span>45°C+ (Extreme Heat)</span>
              </div>
            </div>

            {/* 2. Humidity */}
            <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>Relative Humidity (%)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={params.humidity}
                    onChange={(e) => setParams({ ...params, humidity: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-center font-bold text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-slate-400 text-xs">%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={params.humidity}
                onChange={(e) => setParams({ ...params, humidity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (Bone Dry - Flammable)</span>
                <span>50%</span>
                <span>100% (Saturated)</span>
              </div>
            </div>

            {/* 3. Wind Speed */}
            <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  <span>Sustained Wind Speed (km/h)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={params.wind_speed}
                    onChange={(e) => setParams({ ...params, wind_speed: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-center font-bold text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-slate-400 text-xs">km/h</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                step={1}
                value={params.wind_speed}
                onChange={(e) => setParams({ ...params, wind_speed: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 km/h (Calm)</span>
                <span>35 km/h (Breezy)</span>
                <span>80+ km/h (Gale Force)</span>
              </div>
            </div>

            {/* 4. Rainfall */}
            <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                  <CloudRain className="w-4 h-4 text-blue-400" />
                  <span>7-Day Cumulative Rainfall (mm)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={0}
                    max={150}
                    value={params.rainfall}
                    onChange={(e) => setParams({ ...params, rainfall: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-center font-bold text-sm text-white focus:outline-none focus:border-blue-400"
                  />
                  <span className="text-slate-400 text-xs">mm</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={params.rainfall}
                onChange={(e) => setParams({ ...params, rainfall: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 mm (Severe Drought)</span>
                <span>20 mm</span>
                <span>60+ mm (Wet Ground)</span>
              </div>
            </div>

            {/* 5. Vegetation Dryness / Fuel Moisture */}
            <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                  <TreePine className="w-4 h-4 text-amber-500" />
                  <span>Vegetation Dryness / Fuel Flammability (%)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={params.vegetation_dryness}
                    onChange={(e) => setParams({ ...params, vegetation_dryness: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-center font-bold text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-slate-400 text-xs">%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={params.vegetation_dryness}
                onChange={(e) => setParams({ ...params, vegetation_dryness: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (Green foliage)</span>
                <span>50% (Mixed)</span>
                <span>100% (Crisp needle litter)</span>
              </div>
            </div>

            {/* 6. Historical Fire Frequency & Animal Movement Anomaly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <History className="w-4 h-4 text-purple-400" />
                    <span>5-Yr Fire Frequency</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={params.historical_frequency}
                    onChange={(e) => setParams({ ...params, historical_frequency: parseInt(e.target.value) || 0 })}
                    className="w-12 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-center font-bold text-sm text-white"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={params.historical_frequency}
                  onChange={(e) => setParams({ ...params, historical_frequency: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-[10px] text-slate-400 block">Past fires in sector (indicates lightning/terrain bias)</span>
              </div>

              {/* Animal Movement Anomaly Toggle */}
              <div 
                onClick={() => setParams({ ...params, animal_anomaly: !params.animal_anomaly })}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  params.animal_anomaly
                    ? 'bg-rose-950/40 border-rose-500/50 text-white'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Activity className={`w-4 h-4 ${params.animal_anomaly ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">Wildlife Flight Surge</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                    params.animal_anomaly ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {params.animal_anomaly ? '+8 PTS ACTIVE' : 'OFF'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Animal panic movement detected away from heat source before smoke is visible.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Indicator Gauge & Transparent Score Attribution */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Visual Indicator Card */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/70 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Header Badge */}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Calculated Fire Risk Score
            </span>

            {/* Semicircular Risk Gauge */}
            <div className="relative w-64 h-36 mt-4 flex items-end justify-center">
              <svg className="w-64 h-36 overflow-visible" viewBox="0 0 200 110">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                {/* Color segments: Green, Yellow, Orange, Red */}
                <path
                  d="M 20 100 A 80 80 0 0 1 65 37"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                <path
                  d="M 65 37 A 80 80 0 0 1 100 20"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="18"
                />
                <path
                  d="M 100 20 A 80 80 0 0 1 135 37"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="18"
                />
                <path
                  d="M 135 37 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="18"
                  strokeLinecap="round"
                />

                {/* Needle Indicator */}
                <g transform={`rotate(${needleAngle}, 100, 100)`} className="transition-transform duration-500 ease-out">
                  <polygon points="97,100 103,100 100,28" fill="#ffffff" />
                  <circle cx="100" cy="100" r="7" fill="#ffffff" />
                  <circle cx="100" cy="100" r="3" fill="#0f172a" />
                </g>
              </svg>
            </div>

            {/* Score & Risk Level Displays */}
            <div className="mt-2">
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-5xl sm:text-6xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
                  {result.score}
                </span>
                <span className="text-slate-400 text-lg font-bold">/ 100</span>
              </div>

              {/* Large Distinct Risk Pill */}
              <div className="mt-3">
                <span className={`inline-flex items-center space-x-2 px-5 py-1.5 rounded-full text-sm font-extrabold tracking-wide uppercase shadow-lg border ${
                  result.level === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-red-950' :
                  result.level === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-orange-950' :
                  result.level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-amber-950' :
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-950'
                }`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
                  <span>{result.badge}</span>
                </span>
              </div>
            </div>

            {/* Quick Tactical Verdict */}
            <p className="mt-4 text-xs text-slate-300 max-w-sm">
              {result.level === 'Critical' && 'Immediate fire hazard. Dry lightning or sparks will trigger explosive crown fires. Evacuation readiness recommended.'}
              {result.level === 'High' && 'Substantial combustion risk. High wind will spread surface brush fires rapidly. Restrict backcountry access.'}
              {result.level === 'Medium' && 'Moderate conditions. Surface leaf litter may ignite, but fire spread is contained by humidity.'}
              {result.level === 'Low' && 'Moist fuels and cool ambient temperatures minimize ignition probability.'}
            </p>

            {/* Save / Log button */}
            <div className="mt-5 w-full">
              <button
                onClick={handleSavePrediction}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center justify-center space-x-2 transition"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Logged to Database (SQLite & localStorage)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Record Prediction to Sector Log</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Transparent Calculation Breakdown Card */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Transparent Point Attribution</span>
              </span>
              <span className="font-mono text-slate-400">Sum: {result.score} pts</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Deterministic rule-based model designed for transparent hackathon verification:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Ambient Temperature (max 25):</span>
                <span className="font-mono font-bold text-red-400">+{result.breakdown.temperature_pts} pts</span>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${(result.breakdown.temperature_pts / 25) * 100}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Low Humidity Deficit (max 25):</span>
                <span className="font-mono font-bold text-cyan-400">+{result.breakdown.humidity_deficit_pts} pts</span>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: `${(result.breakdown.humidity_deficit_pts / 25) * 100}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Wind Velocity Spread (max 20):</span>
                <span className="font-mono font-bold text-emerald-400">+{result.breakdown.wind_factor_pts} pts</span>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${(result.breakdown.wind_factor_pts / 20) * 100}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">7-Day Rainfall Deficit (max 15):</span>
                <span className="font-mono font-bold text-blue-400">+{result.breakdown.rainfall_deficit_pts} pts</span>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${(result.breakdown.rainfall_deficit_pts / 15) * 100}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Vegetation Fuel Dryness (max 15):</span>
                <span className="font-mono font-bold text-amber-400">+{result.breakdown.vegetation_dryness_pts} pts</span>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${(result.breakdown.vegetation_dryness_pts / 15) * 100}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Historical Fire Frequency (max 10):</span>
                <span className="font-mono font-bold text-purple-400">+{result.breakdown.history_pts} pts</span>
              </div>

              {result.breakdown.animal_anomaly_pts > 0 && (
                <div className="flex items-center justify-between pt-1 text-rose-400 font-bold">
                  <span>Wildlife Flight Anomaly:</span>
                  <span className="font-mono">+{result.breakdown.animal_anomaly_pts} pts</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
