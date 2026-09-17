export interface ForestZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  temperature: number;
  humidity: number;
  wind_speed: number;
  rainfall_7d: number;
  vegetation_dryness: number;
  fire_frequency_5y: number;
  animal_anomaly: boolean;
  last_updated: string;
  dominant_fuel: string;
  status: string;
}

export interface EarlyWarningAlert {
  id: string;
  zone_id: string;
  zone_name: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  risk_score: number;
  title: string;
  reason: string;
  recommended_action: string;
  timestamp: string;
  status: 'Active' | 'Resolved' | 'Monitoring';
}

export interface SafetyBeacon {
  id: string;
  name: string;
  zone_id: string;
  location: string;
  lat: number;
  lng: number;
  battery_pct: number;
  solar_input_w: number;
  status: 'Standby / Normal' | 'Active Warning' | 'Alarm Activated';
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  strobe_active: boolean;
  speaker_active: boolean;
  direction_message: string;
  guidance_steps: string[];
  last_ping: string;
}

export interface AnimalMovement {
  id: string;
  species: string;
  zone_id: string;
  zone_name: string;
  movement_status: string;
  is_unusual: boolean;
  speed_kmh: number;
  baseline_speed: number;
  direction: string;
  herd_size: number;
  timestamp: string;
  notes: string;
  threat_indicator: string;
}

export interface RiskCalculationResult {
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  badge: string;
  color: string;
  breakdown: {
    temperature_pts: number;
    humidity_deficit_pts: number;
    wind_factor_pts: number;
    rainfall_deficit_pts: number;
    vegetation_dryness_pts: number;
    history_pts: number;
    animal_anomaly_pts: number;
  };
}

export interface SystemStatus {
  success: boolean;
  demo_mode: boolean;
  name: string;
  version: string;
  overall_risk_score: number;
  overall_risk_level: string;
  high_risk_zones_count: number;
  active_alerts_count: number;
  active_beacons_count: number;
  unusual_animal_detections: number;
  alarm_active: boolean;
  alarm_info: {
    active: boolean;
    triggered_at: string | null;
    triggered_by: string | null;
    zone: string;
  };
}
