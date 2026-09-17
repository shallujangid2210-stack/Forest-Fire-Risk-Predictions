import React from 'react';
import { 
  ShieldAlert, 
  Flame, 
  MapPin, 
  Calculator, 
  Bell, 
  Radio, 
  Activity, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles,
  Layers
} from 'lucide-react';
import { SystemStatus } from '../types';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  systemStatus: SystemStatus | null;
  alarmActive: boolean;
  onToggleAlarm: () => void;
  onResetData: () => void;
  onTickSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  systemStatus,
  alarmActive,
  onToggleAlarm,
  onResetData,
  onTickSimulation
}) => {
  const overallScore = systemStatus?.overall_risk_score ?? 74;
  const overallLevel = systemStatus?.overall_risk_level ?? 'High Risk';

  const getRiskBadgeColor = (level: string) => {
    if (level.includes('Critical')) return 'bg-red-500/20 text-red-400 border-red-500/40';
    if (level.includes('High')) return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    if (level.includes('Medium')) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'prediction', label: 'Risk Prediction', icon: Calculator },
    { id: 'map', label: 'Risk Map', icon: MapPin },
    { id: 'alerts', label: 'Early Warnings', icon: Bell, badge: systemStatus?.active_alerts_count },
    { id: 'beacons', label: 'Offline Beacons', icon: Radio },
    { id: 'animals', label: 'Animal Tracking', icon: Activity, badge: systemStatus?.unusual_animal_detections ? '!' : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top emergency broadcast banner when alarm is firing */}
      {alarmActive && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-bold tracking-wide animate-pulse">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
            <span>⚠️ EMERGENCY WILDLAND FIRE ALARM ACTIVE &bull; EVACUATION PROTOCOLS ENGAGED</span>
          </div>
          <button
            onClick={onToggleAlarm}
            className="bg-white text-red-700 px-3 py-1 rounded font-extrabold hover:bg-red-100 active:scale-95 transition-all text-xs uppercase"
          >
            Silence Alarm
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Demo Mode Tag */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center shadow-lg shadow-emerald-950 border border-emerald-400/30">
            <Flame className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
                Forest<span className="text-amber-400">Guard</span>
              </h1>
              {/* Clearly visible Demo Mode indicator */}
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
                Demo Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Forest Fire Risk Prediction & Autonomous Monitoring System
            </p>
          </div>
        </div>

        {/* Center: Live overall risk stat & quick simulation tools */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Overall Risk Pill */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getRiskBadgeColor(overallLevel)}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span className="hidden md:inline text-slate-300">Forest Risk:</span>
            <span>{overallScore}/100</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 ml-1">{overallLevel}</span>
          </div>

          {/* Quick Simulation controls */}
          <button
            onClick={onTickSimulation}
            title="Simulate real-time sensor fluctuation"
            className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Simulate Sensors</span>
          </button>

          <button
            onClick={onResetData}
            title="Reset to hackathon default data"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Large Emergency Alarm Button */}
          <button
            id="emergency-alarm-btn"
            onClick={onToggleAlarm}
            className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm tracking-wide shadow-lg transition-all duration-200 active:scale-95 ${
              alarmActive
                ? 'bg-red-500 text-white animate-pulse shadow-red-500/50 hover:bg-red-600'
                : 'bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-500 hover:to-rose-600 border border-red-400/40 shadow-red-950'
            }`}
          >
            {alarmActive ? (
              <>
                <VolumeX className="w-4 h-4 text-white" />
                <span>STOP ALARM</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span>EMERGENCY ALARM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 overflow-x-auto scrollbar-none border-t border-slate-800/80">
        <nav className="flex space-x-1 sm:space-x-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-black/40 text-white' : 'bg-red-500/80 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
