import { ForestZone, EarlyWarningAlert, SafetyBeacon, AnimalMovement, RiskCalculationResult, SystemStatus } from '../types';
import sampleData from '../../data/sample_data.json';

const STORAGE_KEYS = {
  ZONES: 'forestguard_zones',
  ALERTS: 'forestguard_alerts',
  BEACONS: 'forestguard_beacons',
  ANIMALS: 'forestguard_animals',
  ALARM: 'forestguard_alarm',
  DEMO_MODE: 'forestguard_demo_mode'
};

export interface RiskInputParams {
  temperature: number;
  humidity: number;
  wind_speed: number;
  rainfall: number;
  vegetation_dryness: number;
  historical_frequency: number;
  animal_anomaly?: boolean;
  zone_id?: string;
}

export function computeFireRisk(params: RiskInputParams): RiskCalculationResult {
  const temp = Math.max(-10, Math.min(60, params.temperature));
  const hum = Math.max(0, Math.min(100, params.humidity));
  const wind = Math.max(0, Math.min(150, params.wind_speed));
  const rain = Math.max(0, Math.min(300, params.rainfall));
  const veg = Math.max(0, Math.min(100, params.vegetation_dryness));
  const freq = Math.max(0, Math.min(20, params.historical_frequency));

  // Temperature factor (0 - 25 pts)
  const tempFactor = Math.min(25, Math.max(0, (temp - 15) * 0.83));
  // Low humidity factor (0 - 25 pts)
  const humFactor = Math.min(25, Math.max(0, (100 - hum) * 0.28));
  // Wind speed spread factor (0 - 20 pts)
  const windFactor = Math.min(20, Math.max(0, wind * 0.33));
  // Rainfall deficit factor (0 - 15 pts)
  const rainFactor = Math.min(15, Math.max(0, (40 - rain) * 0.375));
  // Vegetation dryness factor (0 - 15 pts)
  const vegFactor = (veg / 100) * 15;
  // Historical fire occurrence factor (0 - 10 pts)
  const histFactor = Math.min(10, Math.max(0, freq * 2));
  // Animal anomaly flight factor (+8 pts)
  const animalFactor = params.animal_anomaly ? 8 : 0;

  const rawScore = tempFactor + humFactor + windFactor + rainFactor + vegFactor + histFactor + animalFactor;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  let badge = 'Low Risk';
  let color = '#22c55e';

  if (score >= 80) {
    level = 'Critical';
    badge = 'Critical Risk';
    color = '#ef4444';
  } else if (score >= 60) {
    level = 'High';
    badge = 'High Risk';
    color = '#f97316';
  } else if (score >= 30) {
    level = 'Medium';
    badge = 'Medium Risk';
    color = '#eab308';
  }

  return {
    score,
    level,
    badge,
    color,
    breakdown: {
      temperature_pts: Math.round(tempFactor * 10) / 10,
      humidity_deficit_pts: Math.round(humFactor * 10) / 10,
      wind_factor_pts: Math.round(windFactor * 10) / 10,
      rainfall_deficit_pts: Math.round(rainFactor * 10) / 10,
      vegetation_dryness_pts: Math.round(vegFactor * 10) / 10,
      history_pts: Math.round(histFactor * 10) / 10,
      animal_anomaly_pts: animalFactor
    }
  };
}

class ForestGuardApiService {
  private zones: ForestZone[] = [];
  private alerts: EarlyWarningAlert[] = [];
  private beacons: SafetyBeacon[] = [];
  private animals: AnimalMovement[] = [];
  private alarmActive = false;
  private alarmZone = "Pine Ridge Sector Alpha";
  private demoMode = true;

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage(): void {
    try {
      const zJson = localStorage.getItem(STORAGE_KEYS.ZONES);
      const aJson = localStorage.getItem(STORAGE_KEYS.ALERTS);
      const bJson = localStorage.getItem(STORAGE_KEYS.BEACONS);
      const mJson = localStorage.getItem(STORAGE_KEYS.ANIMALS);
      const alarmJson = localStorage.getItem(STORAGE_KEYS.ALARM);

      this.zones = zJson ? JSON.parse(zJson) : (sampleData.zones as ForestZone[]);
      this.alerts = aJson ? JSON.parse(aJson) : (sampleData.alerts as EarlyWarningAlert[]);
      this.beacons = bJson ? JSON.parse(bJson) : (sampleData.beacons as SafetyBeacon[]);
      this.animals = mJson ? JSON.parse(mJson) : (sampleData.animals as AnimalMovement[]);
      this.alarmActive = alarmJson ? JSON.parse(alarmJson) : false;

      // Save defaults if first time
      if (!zJson) this.persist();
    } catch {
      this.zones = sampleData.zones as ForestZone[];
      this.alerts = sampleData.alerts as EarlyWarningAlert[];
      this.beacons = sampleData.beacons as SafetyBeacon[];
      this.animals = sampleData.animals as AnimalMovement[];
      this.alarmActive = false;
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(this.zones));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(this.alerts));
      localStorage.setItem(STORAGE_KEYS.BEACONS, JSON.stringify(this.beacons));
      localStorage.setItem(STORAGE_KEYS.ANIMALS, JSON.stringify(this.animals));
      localStorage.setItem(STORAGE_KEYS.ALARM, JSON.stringify(this.alarmActive));
    } catch {
      // ignore storage quota errors
    }
  }

  public async getStatus(): Promise<SystemStatus> {
    const highRisk = this.zones.filter(z => z.risk_score >= 60).length;
    const activeAlerts = this.alerts.filter(a => a.status === 'Active').length;
    const avgRisk = Math.round(this.zones.reduce((acc, z) => acc + z.risk_score, 0) / (this.zones.length || 1));
    const unusualAnimals = this.animals.filter(a => a.is_unusual).length;

    let overallLevel = "Low Risk";
    if (avgRisk >= 80) overallLevel = "Critical Risk";
    else if (avgRisk >= 60) overallLevel = "High Risk";
    else if (avgRisk >= 30) overallLevel = "Medium Risk";

    return {
      success: true,
      demo_mode: this.demoMode,
      name: "ForestGuard",
      version: "1.0.0",
      overall_risk_score: avgRisk,
      overall_risk_level: overallLevel,
      high_risk_zones_count: highRisk,
      active_alerts_count: activeAlerts,
      active_beacons_count: this.beacons.length,
      unusual_animal_detections: unusualAnimals,
      alarm_active: this.alarmActive,
      alarm_info: {
        active: this.alarmActive,
        triggered_at: this.alarmActive ? new Date().toISOString() : null,
        triggered_by: "System Operator",
        zone: this.alarmZone
      }
    };
  }

  public async getZones(): Promise<ForestZone[]> {
    return [...this.zones];
  }

  public async getZoneById(id: string): Promise<ForestZone | null> {
    const zone = this.zones.find(z => z.id === id);
    return zone ? { ...zone } : null;
  }

  public async calculateRisk(params: RiskInputParams): Promise<RiskCalculationResult> {
    return computeFireRisk(params);
  }

  public async getAlerts(): Promise<EarlyWarningAlert[]> {
    return [...this.alerts];
  }

  public async createAlert(alertData: Partial<EarlyWarningAlert>): Promise<EarlyWarningAlert> {
    const newAlert: EarlyWarningAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      zone_id: alertData.zone_id || 'Z-01',
      zone_name: alertData.zone_name || 'Active Forest Sector',
      severity: alertData.severity || 'High',
      risk_score: alertData.risk_score || 75,
      title: alertData.title || 'Simulated Emergency Advisory',
      reason: alertData.reason || 'Telemetry parameters surpassed danger threshold',
      recommended_action: alertData.recommended_action || 'Commence tactical fire line patrols',
      timestamp: 'Just now',
      status: 'Active'
    };

    this.alerts.unshift(newAlert);
    this.persist();
    return newAlert;
  }

  public async getBeacons(): Promise<SafetyBeacon[]> {
    return [...this.beacons];
  }

  public async toggleBeacon(beaconId: string): Promise<SafetyBeacon> {
    const beacon = this.beacons.find(b => b.id === beaconId);
    if (!beacon) throw new Error('Beacon not found');

    if (beacon.status === 'Alarm Activated') {
      beacon.status = 'Standby / Normal';
      beacon.strobe_active = false;
      beacon.speaker_active = false;
    } else {
      beacon.status = 'Alarm Activated';
      beacon.strobe_active = true;
      beacon.speaker_active = true;
    }
    this.persist();
    return { ...beacon };
  }

  public async getAnimals(): Promise<AnimalMovement[]> {
    return [...this.animals];
  }

  public async toggleAlarm(active?: boolean, zoneName?: string): Promise<{ active: boolean; zone: string }> {
    this.alarmActive = active !== undefined ? active : !this.alarmActive;
    if (zoneName) this.alarmZone = zoneName;

    // If activating alarm, sync critical beacons to alarm state
    if (this.alarmActive) {
      this.beacons.forEach(b => {
        if (b.risk_level === 'Critical' || b.risk_level === 'High') {
          b.status = 'Alarm Activated';
          b.strobe_active = true;
          b.speaker_active = true;
        }
      });
    }

    this.persist();
    return { active: this.alarmActive, zone: this.alarmZone };
  }

  public isAlarmActive(): boolean {
    return this.alarmActive;
  }

  public resetToDefaults(): void {
    this.zones = JSON.parse(JSON.stringify(sampleData.zones));
    this.alerts = JSON.parse(JSON.stringify(sampleData.alerts));
    this.beacons = JSON.parse(JSON.stringify(sampleData.beacons));
    this.animals = JSON.parse(JSON.stringify(sampleData.animals));
    this.alarmActive = false;
    this.persist();
  }

  /**
   * Simulates real-time sensor fluctuation for dynamic hackathon demos
   */
  public simulateLiveSensorTick(): void {
    this.zones = this.zones.map(z => {
      // Subtle fluctuations in temperature (+/- 0.3°C) and wind (+/- 0.8 km/h)
      const tempDelta = (Math.random() - 0.48) * 0.4;
      const windDelta = (Math.random() - 0.48) * 1.0;
      const newTemp = Math.round((z.temperature + tempDelta) * 10) / 10;
      const newWind = Math.round(Math.max(2, z.wind_speed + windDelta) * 10) / 10;

      // Recalculate risk score
      const calc = computeFireRisk({
        temperature: newTemp,
        humidity: z.humidity,
        wind_speed: newWind,
        rainfall: z.rainfall_7d,
        vegetation_dryness: z.vegetation_dryness,
        historical_frequency: z.fire_frequency_5y,
        animal_anomaly: z.animal_anomaly
      });

      return {
        ...z,
        temperature: newTemp,
        wind_speed: newWind,
        risk_score: calc.score,
        risk_level: calc.level,
        last_updated: 'Just now'
      };
    });

    this.persist();
  }
}

export const api = new ForestGuardApiService();
