import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  Send, 
  Radio, 
  Sparkles,
  Info,
  X,
  Volume2
} from 'lucide-react';
import { EarlyWarningAlert, ForestZone } from '../types';

interface EarlyWarningSystemProps {
  alerts: EarlyWarningAlert[];
  zones: ForestZone[];
  onCreateAlert: (alert: Partial<EarlyWarningAlert>) => void;
  onTriggerAlarm: () => void;
}

export const EarlyWarningSystem: React.FC<EarlyWarningSystemProps> = ({
  alerts,
  zones,
  onCreateAlert,
  onTriggerAlarm
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  // New simulated alert form state
  const [newZoneId, setNewZoneId] = useState<string>(zones[0]?.id || 'Z-01');
  const [newSeverity, setNewSeverity] = useState<'Critical' | 'High' | 'Medium'>('Critical');
  const [newScore, setNewScore] = useState<number>(85);
  const [newTitle, setNewTitle] = useState<string>('Thermal Flare & Rapid Wind Shift');
  const [newReason, setNewReason] = useState<string>('Sensors recorded sudden 40°C temperature with 50 km/h wind gusts into dry chaparral canopy.');
  const [newAction, setNewAction] = useState<string>('Dispatch thermal reconnaissance drone, sound offline solar beacons, and close West Gate trails.');

  // Browser notification trigger
  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('Browser notifications not supported in this browser. Showing in-app banner instead.');
      setTimeout(() => setNotificationStatus(null), 4000);
      return;
    }

    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        new Notification('ForestGuard Wildfire Early Warning', {
          body: 'CRITICAL ALERT: Pine Ridge Sector Alpha risk score reached 88/100. Evacuate trails.',
          icon: '/favicon.ico'
        });
        setNotificationStatus('Browser notification sent successfully!');
      } else {
        setNotificationStatus('Browser permission denied or running inside sandboxed frame. Visual alert triggered in app.');
      }
    } catch {
      setNotificationStatus('Visual alert triggered (Running in preview frame mode).');
    }
    setTimeout(() => setNotificationStatus(null), 4000);
  };

  const handleCreateCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const zoneObj = zones.find(z => z.id === newZoneId);
    onCreateAlert({
      zone_id: newZoneId,
      zone_name: zoneObj?.name || 'Forest Sector',
      severity: newSeverity,
      risk_score: newScore,
      title: newTitle,
      reason: newReason,
      recommended_action: newAction,
    });
    setShowSimulateModal(false);
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'All') return true;
    return a.severity === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit',sans-serif]">
              Early Warning & Autonomous Incident Dispatch
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated notifications, tactical containment instructions, and offline beacon activations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRequestNotification}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Browser Notification</span>
          </button>

          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Simulate Sensor Alert</span>
          </button>
        </div>
      </div>

      {/* Browser Notification Feedback Toast */}
      {notificationStatus && (
        <div className="p-3 rounded-xl bg-sky-950/80 border border-sky-500/50 text-xs text-sky-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-sky-400" />
            <span>{notificationStatus}</span>
          </div>
          <button onClick={() => setNotificationStatus(null)} className="text-sky-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* College Hackathon Demo Disclaimer Pill */}
      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center space-x-2 text-xs text-slate-400">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="text-slate-200">Hackathon Prototype Notice:</strong> Visual and in-browser audio alarms are simulated for judge demonstration without external SMS billing or real emergency service dispatch dependencies.
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Severity:</span>
        {['All', 'Critical', 'High', 'Medium'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              filter === lvl
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {lvl} ({lvl === 'All' ? alerts.length : alerts.filter(a => a.severity === lvl).length})
          </button>
        ))}
      </div>

      {/* Alerts List Cards */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-800/40 rounded-2xl p-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No active warnings in this category.</p>
            <p className="text-xs text-slate-500 mt-1">All forest sectors are currently operating within safe thresholds.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl p-5 border shadow-xl transition-all relative overflow-hidden ${
                alert.severity === 'Critical'
                  ? 'bg-slate-900/90 border-red-500/50 hover:border-red-400'
                  : alert.severity === 'High'
                  ? 'bg-slate-900/90 border-orange-500/40 hover:border-orange-400'
                  : 'bg-slate-900/90 border-amber-500/30 hover:border-amber-400'
              }`}
            >
              {/* Left Color Accent Bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  alert.severity === 'Critical' ? 'bg-red-500' :
                  alert.severity === 'High' ? 'bg-orange-500' : 'bg-amber-500'
                }`}
              />

              <div className="pl-2 space-y-3">
                {/* Card Header */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        alert.severity === 'Critical' ? 'bg-red-500 text-white' :
                        alert.severity === 'High' ? 'bg-orange-500 text-white' :
                        'bg-amber-500 text-slate-950 font-bold'
                      }`}>
                        {alert.severity} Hazard Alert
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">ID: {alert.id}</span>
                      <span className="text-[11px] text-slate-500">&bull; {alert.timestamp}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                      {alert.title}
                    </h3>
                  </div>

                  {/* Affected Zone & Risk Score Badge (Required by prompt) */}
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-xs text-slate-300 font-semibold justify-end">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{alert.zone_name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Sector {alert.zone_id}</span>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl font-black text-sm border ${
                      alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                      alert.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {alert.risk_score}/100
                    </div>
                  </div>
                </div>

                {/* Reason for Increased Risk (Required by prompt) */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Root Hazard Cause</span>
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {alert.reason}
                  </p>
                </div>

                {/* Recommended Safety Action (Required by prompt) */}
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1 flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recommended Tactical Safety Action</span>
                  </span>
                  <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                    {alert.recommended_action}
                  </p>
                </div>

                {/* Quick Action Footer */}
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-xs gap-2">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Radio className="w-3.5 h-3.5 text-sky-400" />
                    <span>Solar beacons broadcasted in sector</span>
                  </span>

                  <button
                    onClick={onTriggerAlarm}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/30 text-xs font-bold transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Trigger Evacuation Siren</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Custom Alert / Simulation */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Simulate Early Warning Incident</span>
              </h3>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomAlert} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Affected Forest Sector</label>
                <select
                  value={newZoneId}
                  onChange={(e) => setNewZoneId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name} ({z.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Alert Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as 'Critical' | 'High' | 'Medium')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Risk Score (0-100)</label>
                  <input
                    type="number"
                    min={30}
                    max={100}
                    value={newScore}
                    onChange={(e) => setNewScore(parseInt(e.target.value) || 75)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Increased Risk</label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recommended Safety Action</label>
                <textarea
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
