/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { RiskPrediction } from './components/RiskPrediction';
import { RiskMap } from './components/RiskMap';
import { EarlyWarningSystem } from './components/EarlyWarningSystem';
import { PhoneFreeBeacons } from './components/PhoneFreeBeacons';
import { AnimalMonitoring } from './components/AnimalMonitoring';
import { EmergencyAlarmModal } from './components/EmergencyAlarmModal';
import { api } from './services/api';
import { ForestZone, EarlyWarningAlert, SafetyBeacon, AnimalMovement, SystemStatus } from './types';
import { playEmergencyAlarm, stopEmergencyAlarm } from './utils/audio';
import { TreePine, Flame, Github, Code, CheckCircle, Database } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [zones, setZones] = useState<ForestZone[]>([]);
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [beacons, setBeacons] = useState<SafetyBeacon[]>([]);
  const [animals, setAnimals] = useState<AnimalMovement[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [selectedZone, setSelectedZone] = useState<ForestZone | null>(null);
  const [alarmActive, setAlarmActive] = useState<boolean>(false);
  const [alarmModalOpen, setAlarmModalOpen] = useState<boolean>(false);
  const [affectedZoneName, setAffectedZoneName] = useState<string>('Pine Ridge Sector Alpha');
  const [loading, setLoading] = useState<boolean>(true);

  // Load all initial state from API / Local SQLite store
  const loadData = useCallback(async () => {
    try {
      const [zList, aList, bList, mList, sStatus] = await Promise.all([
        api.getZones(),
        api.getAlerts(),
        api.getBeacons(),
        api.getAnimals(),
        api.getStatus()
      ]);

      setZones(zList);
      setAlerts(aList);
      setBeacons(bList);
      setAnimals(mList);
      setSystemStatus(sStatus);
      setAlarmActive(sStatus.alarm_active);
      if (!selectedZone && zList.length > 0) {
        setSelectedZone(zList[0]);
      }
    } catch (err) {
      console.error('Failed to load ForestGuard data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedZone]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic subtle sensor fluctuation for demo mode (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      api.simulateLiveSensorTick();
      loadData();
    }, 12000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Emergency Alarm Toggle Handler
  const handleToggleAlarm = async (targetZone?: string) => {
    const nextState = !alarmActive;
    const zoneName = targetZone || (selectedZone ? selectedZone.name : 'Pine Ridge Sector Alpha');

    if (nextState) {
      playEmergencyAlarm();
      setAlarmActive(true);
      setAffectedZoneName(zoneName);
      setAlarmModalOpen(true);
      await api.toggleAlarm(true, zoneName);
    } else {
      stopEmergencyAlarm();
      setAlarmActive(false);
      setAlarmModalOpen(false);
      await api.toggleAlarm(false);
    }

    // Refresh status
    const status = await api.getStatus();
    setSystemStatus(status);
    const updatedBeacons = await api.getBeacons();
    setBeacons(updatedBeacons);
  };

  const handleStopAlarmFromModal = () => {
    stopEmergencyAlarm();
    setAlarmActive(false);
    setAlarmModalOpen(false);
    api.toggleAlarm(false);
    api.getStatus().then(setSystemStatus);
    api.getBeacons().then(setBeacons);
  };

  const handleCreateAlert = async (alertData: Partial<EarlyWarningAlert>) => {
    await api.createAlert(alertData);
    const updatedAlerts = await api.getAlerts();
    setAlerts(updatedAlerts);
    const status = await api.getStatus();
    setSystemStatus(status);
  };

  const handleToggleBeacon = async (beaconId: string) => {
    await api.toggleBeacon(beaconId);
    const updatedBeacons = await api.getBeacons();
    setBeacons(updatedBeacons);
  };

  const handleResetData = () => {
    stopEmergencyAlarm();
    setAlarmActive(false);
    setAlarmModalOpen(false);
    api.resetToDefaults();
    loadData();
  };

  const handleTickSimulation = () => {
    api.simulateLiveSensorTick();
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header with Navigation & Alarm Button */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        systemStatus={systemStatus}
        alarmActive={alarmActive}
        onToggleAlarm={() => handleToggleAlarm()}
        onResetData={handleResetData}
        onTickSimulation={handleTickSimulation}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-400">Loading ForestGuard Intelligence Network...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <HomeDashboard
                systemStatus={systemStatus}
                zones={zones}
                alerts={alerts}
                onNavigate={setCurrentTab}
                onSelectZone={setSelectedZone}
                onTriggerAlarm={() => handleToggleAlarm()}
                alarmActive={alarmActive}
              />
            )}

            {currentTab === 'prediction' && (
              <RiskPrediction />
            )}

            {currentTab === 'map' && (
              <RiskMap
                zones={zones}
                beacons={beacons}
                animals={animals}
                selectedZone={selectedZone}
                onSelectZone={setSelectedZone}
                onTriggerEvacuation={(zoneName) => handleToggleAlarm(zoneName)}
              />
            )}

            {currentTab === 'alerts' && (
              <EarlyWarningSystem
                alerts={alerts}
                zones={zones}
                onCreateAlert={handleCreateAlert}
                onTriggerAlarm={() => handleToggleAlarm()}
              />
            )}

            {currentTab === 'beacons' && (
              <PhoneFreeBeacons
                beacons={beacons}
                onToggleBeacon={handleToggleBeacon}
              />
            )}

            {currentTab === 'animals' && (
              <AnimalMonitoring
                animals={animals}
                zones={zones}
                onNavigateToMap={() => setCurrentTab('map')}
              />
            )}
          </>
        )}
      </main>

      {/* Emergency Alarm Siren Modal */}
      <EmergencyAlarmModal
        isOpen={alarmModalOpen}
        onClose={handleStopAlarmFromModal}
        affectedZoneName={affectedZoneName}
        zones={zones}
        beacons={beacons}
      />

      {/* Footer with Hackathon & System Details */}
      <footer className="mt-12 bg-slate-900 border-t border-slate-800/80 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-amber-200">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">ForestGuard</span>
              <span className="text-slate-500 ml-2">&bull; College Hackathon Wildfire Prevention Prototype</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center space-x-1 text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Flask + SQLite Ready</span>
            </span>
            <span>&bull;</span>
            <span className="text-slate-300">Leaflet.js Maps</span>
            <span>&bull;</span>
            <span className="text-slate-300">Chart.js Analytics</span>
            <span>&bull;</span>
            <span className="text-slate-300">Web Audio API Siren</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            Designed for 100% offline hackathon demonstration
          </div>
        </div>
      </footer>
    </div>
  );
}
