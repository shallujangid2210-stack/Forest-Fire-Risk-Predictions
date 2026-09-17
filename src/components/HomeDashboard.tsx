import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Calculator, 
  Bell, 
  Radio, 
  Activity, 
  Thermometer, 
  Wind, 
  Droplets, 
  ArrowRight,
  Sparkles,
  TreePine,
  AlertTriangle,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { ForestZone, EarlyWarningAlert, SystemStatus } from '../types';
import { TrendChart } from './TrendChart';

interface HomeDashboardProps {
  systemStatus: SystemStatus | null;
  zones: ForestZone[];
  alerts: EarlyWarningAlert[];
  onNavigate: (tab: string) => void;
  onSelectZone: (zone: ForestZone) => void;
  onTriggerAlarm: () => void;
  alarmActive: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  systemStatus,
  zones,
  alerts,
  onNavigate,
  onSelectZone,
  onTriggerAlarm,
  alarmActive
}) => {
  const overallRisk = systemStatus?.overall_risk_score ?? 74;
  const overallLevel = systemStatus?.overall_risk_level ?? 'High Risk';
  const highRiskCount = zones.filter(z => z.risk_score >= 60).length;
  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  const criticalZones = zones
    .filter(z => z.risk_score >= 60)
    .sort((a, b) => b.risk_score - a.risk_score);

  // 24-hour simulation trend points for Chart.js
  const trendLabels = ['00:00', '04:00', '08:00', '12:00', '14:00', '16:00', '18:00', '20:00', 'Now'];
  const trendRiskScores = [32, 28, 45, 62, 78, 85, 81, 75, overallRisk];
  const trendTemperatures = [18, 16, 22, 31, 38, 40, 37, 32, 36];

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (score >= 60) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    if (score >= 30) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Project Explanation Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 p-5 sm:p-7 shadow-xl">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <TreePine className="w-64 h-64 text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              College Hackathon Edition
            </span>
            <span className="text-xs text-slate-400">Live Wildfire Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit',sans-serif]">
            Autonomous Forest Fire Risk Prediction & Early Warning
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            ForestGuard synthesizes real-time micro-weather sensors, canopy vegetation dryness, historical fire frequency, satellite hotspot data, and animal movement anomalies to predict fire threats before combustion spreads.
          </p>

          {/* Quick Jump Action Buttons (Required by prompt) */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              id="quick-btn-map"
              onClick={() => onNavigate('map')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950 transition-all hover:translate-y-[-1px]"
            >
              <MapPin className="w-4 h-4" />
              <span>View Risk Map</span>
            </button>

            <button
              id="quick-btn-prediction"
              onClick={() => onNavigate('prediction')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all hover:translate-y-[-1px]"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Check Risk Calculator</span>
            </button>

            <button
              id="quick-btn-alerts"
              onClick={() => onNavigate('alerts')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all hover:translate-y-[-1px]"
            >
              <Bell className="w-4 h-4 text-rose-400" />
              <span>Emergency Alerts ({activeAlertsCount})</span>
            </button>

            <button
              id="quick-btn-alarm"
              onClick={onTriggerAlarm}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all ${
                alarmActive
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-500/40'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>{alarmActive ? 'Alarm Sounding (Stop)' : 'Test Alarm Siren'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Forest Fire Risk */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Overall Fire Risk</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit',sans-serif]">
              {overallRisk}
            </span>
            <span className="text-slate-400 text-sm">/ 100</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              overallRisk >= 80 ? 'bg-red-500/20 text-red-400' :
              overallRisk >= 60 ? 'bg-orange-500/20 text-orange-400' :
              overallRisk >= 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {overallLevel}
            </span>
            <span className="text-[11px] text-slate-400">Mean across 6 sectors</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 w-full bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                overallRisk >= 80 ? 'bg-red-500' :
                overallRisk >= 60 ? 'bg-orange-500' :
                overallRisk >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
              }`} 
              style={{ width: `${overallRisk}%` }}
            />
          </div>
        </div>

        {/* Card 2: Number of High-Risk Zones */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-lg relative">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>High-Risk Zones</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit',sans-serif]">
              {highRiskCount}
            </span>
            <span className="text-slate-400 text-sm">of {zones.length} zones</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Sectors exceeding 60/100 threshold requiring active monitoring.
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-orange-400 font-medium">
            <button onClick={() => onNavigate('map')} className="hover:underline flex items-center space-x-1">
              <span>Inspect on Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Active Early Alerts */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-lg relative">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Active Alerts</span>
            <Bell className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit',sans-serif]">
              {activeAlertsCount}
            </span>
            <span className="text-slate-400 text-sm">active warnings</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Automated alerts dispatched to rangers and offline solar beacons.
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-rose-400 font-medium">
            <button onClick={() => onNavigate('alerts')} className="hover:underline flex items-center space-x-1">
              <span>View Safety Actions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Phone-Free Solar Beacons & Bio-Sensors */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-lg relative">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Phone-Free Beacons</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-['Outfit',sans-serif]">
              {systemStatus?.active_beacons_count ?? 4}
            </span>
            <span className="text-slate-400 text-sm">Solar Units Online</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Offline LoRa beacons provide audio alarms and evacuation arrows.
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-emerald-400 font-medium">
            <button onClick={() => onNavigate('beacons')} className="hover:underline flex items-center space-x-1">
              <span>Beacon Status</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Center Grid: 24-Hour Trend Chart & High-Risk Zones Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chart.js 24-Hour Risk Curve */}
        <div className="lg:col-span-2 bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-lg flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit',sans-serif]">
                Diurnal Fire Risk & Ambient Temperature Trend (24h)
              </h3>
              <p className="text-xs text-slate-400">
                Correlating afternoon thermal peak with wind velocity spikes.
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
              Chart.js Visualizer
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <TrendChart
              labels={trendLabels}
              datasets={[
                {
                  label: 'Fire Risk Index (0-100)',
                  data: trendRiskScores,
                  borderColor: '#f97316',
                  backgroundColor: 'rgba(249, 115, 22, 0.15)',
                  fill: true,
                },
                {
                  label: 'Ambient Temperature (°C)',
                  data: trendTemperatures,
                  borderColor: '#38bdf8',
                  backgroundColor: 'transparent',
                }
              ]}
              yAxisLabel="Value"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Afternoon peak (14:00 - 17:00) represents highest combustion threat</span>
            </span>
            <span className="font-mono text-[11px]">Updated every 15 min</span>
          </div>
        </div>

        {/* Right 1 Col: High-Risk Sector Watchlist */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                Priority Sector Watchlist
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-semibold">
                {criticalZones.length} Alerting
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Forest sectors currently reaching High or Critical risk thresholds.
            </p>

            <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin">
              {criticalZones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => {
                    onSelectZone(zone);
                    onNavigate('map');
                  }}
                  className="group p-3 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-700/60 hover:border-amber-500/50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                        {zone.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Fuel: {zone.dominant_fuel}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold border ${getRiskColor(zone.risk_score)}`}>
                      {zone.risk_score} - {zone.risk_level}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px] text-slate-300">
                    <div className="flex items-center space-x-1">
                      <Thermometer className="w-3 h-3 text-red-400" />
                      <span>{zone.temperature}°C</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      <span>{zone.humidity}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Wind className="w-3 h-3 text-emerald-400" />
                      <span>{zone.wind_speed} km/h</span>
                    </div>
                  </div>

                  {zone.animal_anomaly && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-rose-400 flex items-center space-x-1">
                      <Activity className="w-3 h-3 animate-pulse" />
                      <span>Wildlife flight surge detected in sector</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <button
              onClick={() => onNavigate('map')}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              <span>Explore All 6 Forest Sectors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Hackathon Architecture Banner */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950 flex items-center justify-center border border-emerald-500/30">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Full-Stack Architecture Ready for Hackathon Judging
            </h4>
            <p className="text-xs text-slate-400">
              Includes Python Flask REST endpoints (`/api/risk`, `/api/zones`, `/api/beacons`), SQLite tables, Leaflet.js, and simulated bio-telemetry.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQLite Embedded</span>
          </span>
          <span>&bull;</span>
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Leaflet 1.9</span>
          </span>
          <span>&bull;</span>
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero API Keys Needed</span>
          </span>
        </div>
      </div>
    </div>
  );
};
