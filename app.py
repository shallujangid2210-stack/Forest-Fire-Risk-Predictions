#!/usr/bin/env python3
"""
ForestGuard – Forest Fire Risk Prediction & Monitoring System
Flask Backend with SQLite Database and Transparent Risk Calculation Engine
Built for College Hackathon
"""

import os
import json
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
try:
    from flask_cors import CORS
except ImportError:
    CORS = None

app = Flask(__name__, static_folder='static', template_folder='templates')
if CORS:
    CORS(app)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.db')
SAMPLE_DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'sample_data.json')

# Global Emergency Alarm state for the demo
alarm_state = {
    "active": False,
    "triggered_at": None,
    "triggered_by": None,
    "zone": "Pine Ridge Sector Alpha"
}

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes SQLite tables and seeds sample data if needed."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS zones (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        radius REAL NOT NULL,
        risk_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        wind_speed REAL NOT NULL,
        rainfall_7d REAL NOT NULL,
        vegetation_dryness INTEGER NOT NULL,
        fire_frequency_5y INTEGER NOT NULL,
        animal_anomaly INTEGER NOT NULL DEFAULT 0,
        last_updated TEXT NOT NULL,
        dominant_fuel TEXT,
        status TEXT
    )''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS weather_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zone_id TEXT NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        wind_speed REAL NOT NULL,
        rainfall_7d REAL NOT NULL,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (zone_id) REFERENCES zones(id)
    )''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS risk_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zone_id TEXT,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        wind_speed REAL NOT NULL,
        rainfall_7d REAL NOT NULL,
        vegetation_dryness INTEGER NOT NULL,
        fire_frequency_5y INTEGER NOT NULL,
        calculated_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        zone_id TEXT NOT NULL,
        zone_name TEXT NOT NULL,
        severity TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        title TEXT NOT NULL,
        reason TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL
    )''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS animal_movements (
        id TEXT PRIMARY KEY,
        species TEXT NOT NULL,
        zone_id TEXT NOT NULL,
        zone_name TEXT NOT NULL,
        movement_status TEXT NOT NULL,
        is_unusual INTEGER NOT NULL,
        speed_kmh REAL NOT NULL,
        baseline_speed REAL NOT NULL,
        direction TEXT NOT NULL,
        herd_size INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        notes TEXT,
        threat_indicator TEXT
    )''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS beacons (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        zone_id TEXT NOT NULL,
        location TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        battery_pct INTEGER NOT NULL,
        solar_input_w REAL NOT NULL,
        status TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        strobe_active INTEGER NOT NULL,
        speaker_active INTEGER NOT NULL,
        direction_message TEXT,
        guidance_steps TEXT,
        last_ping TEXT
    )''')

    conn.commit()

    # Seed if zones is empty
    cursor.execute('SELECT COUNT(*) FROM zones')
    if cursor.fetchone()[0] == 0:
        if os.path.exists(SAMPLE_DATA_PATH):
            with open(SAMPLE_DATA_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)

            for z in data.get('zones', []):
                cursor.execute('''
                INSERT INTO zones (id, name, lat, lng, radius, risk_score, risk_level, temperature, humidity,
                                   wind_speed, rainfall_7d, vegetation_dryness, fire_frequency_5y,
                                   animal_anomaly, last_updated, dominant_fuel, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    z['id'], z['name'], z['lat'], z['lng'], z['radius'], z['risk_score'], z['risk_level'],
                    z['temperature'], z['humidity'], z['wind_speed'], z['rainfall_7d'],
                    z['vegetation_dryness'], z['fire_frequency_5y'], 1 if z.get('animal_anomaly') else 0,
                    z['last_updated'], z.get('dominant_fuel', ''), z.get('status', 'Normal')
                ))

            for a in data.get('alerts', []):
                cursor.execute('''
                INSERT INTO alerts (id, zone_id, zone_name, severity, risk_score, title, reason, recommended_action, timestamp, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    a['id'], a['zone_id'], a['zone_name'], a['severity'], a['risk_score'],
                    a['title'], a['reason'], a['recommended_action'], a['timestamp'], a['status']
                ))

            for m in data.get('animals', []):
                cursor.execute('''
                INSERT INTO animal_movements (id, species, zone_id, zone_name, movement_status, is_unusual, speed_kmh,
                                              baseline_speed, direction, herd_size, timestamp, notes, threat_indicator)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    m['id'], m['species'], m['zone_id'], m['zone_name'], m['movement_status'],
                    1 if m.get('is_unusual') else 0, m['speed_kmh'], m['baseline_speed'],
                    m['direction'], m['herd_size'], m['timestamp'], m.get('notes', ''), m.get('threat_indicator', '')
                ))

            for b in data.get('beacons', []):
                cursor.execute('''
                INSERT INTO beacons (id, name, zone_id, location, lat, lng, battery_pct, solar_input_w, status,
                                    risk_level, strobe_active, speaker_active, direction_message, guidance_steps, last_ping)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    b['id'], b['name'], b['zone_id'], b['location'], b['lat'], b['lng'],
                    b['battery_pct'], b['solar_input_w'], b['status'], b['risk_level'],
                    1 if b.get('strobe_active') else 0, 1 if b.get('speaker_active') else 0,
                    b.get('direction_message', ''), json.dumps(b.get('guidance_steps', [])), b.get('last_ping', '')
                ))

            conn.commit()
    conn.close()

def calculate_fire_risk(temp, humidity, wind_speed, rainfall, veg_dryness, fire_freq, animal_anomaly=False):
    """
    Transparent rule-based fire risk score (0-100).
    Can be replaced with ML model (e.g., Random Forest or XGBoost) in future iterations.
    """
    # 1. Temperature factor (0 to 25 pts)
    temp_factor = min(25.0, max(0.0, (temp - 15.0) * 0.83))

    # 2. Humidity deficit factor (0 to 25 pts): low humidity drastically increases flammability
    humidity_factor = min(25.0, max(0.0, (100.0 - humidity) * 0.28))

    # 3. Wind speed spread factor (0 to 20 pts)
    wind_factor = min(20.0, max(0.0, wind_speed * 0.33))

    # 4. Rainfall deficit (0 to 15 pts): 0mm in 7 days gives full 15 pts
    rainfall_factor = min(15.0, max(0.0, (40.0 - rainfall) * 0.375))

    # 5. Vegetation dryness / fuel moisture (0 to 15 pts)
    veg_factor = (veg_dryness / 100.0) * 15.0

    # 6. Historical fire frequency (0 to 10 pts)
    history_factor = min(10.0, max(0.0, fire_freq * 2.0))

    # 7. Animal anomaly early biological warning (+5 to +10 pts)
    animal_factor = 8.0 if animal_anomaly else 0.0

    raw_score = temp_factor + humidity_factor + wind_factor + rainfall_factor + veg_factor + history_factor + animal_factor
    score = int(round(min(100.0, max(0.0, raw_score))))

    if score >= 80:
        level = "Critical"
        color = "#ef4444"
        badge = "Critical Risk"
    elif score >= 60:
        level = "High"
        color = "#f97316"
        badge = "High Risk"
    elif score >= 30:
        level = "Medium"
        color = "#eab308"
        badge = "Medium Risk"
    else:
        level = "Low"
        color = "#22c55e"
        badge = "Low Risk"

    return {
        "score": score,
        "level": level,
        "badge": badge,
        "color": color,
        "breakdown": {
            "temperature_pts": round(temp_factor, 1),
            "humidity_deficit_pts": round(humidity_factor, 1),
            "wind_factor_pts": round(wind_factor, 1),
            "rainfall_deficit_pts": round(rainfall_factor, 1),
            "vegetation_dryness_pts": round(veg_factor, 1),
            "history_pts": round(history_factor, 1),
            "animal_anomaly_pts": animal_factor
        }
    }

# ==================== API ROUTES ====================

@app.route('/api/status', methods=['GET'])
def get_status():
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT COUNT(*) FROM zones WHERE risk_score >= 60')
    high_risk_zones = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM alerts WHERE status = "Active"')
    active_alerts = c.fetchone()[0]
    c.execute('SELECT AVG(risk_score) FROM zones')
    avg_risk = c.fetchone()[0] or 50
    c.execute('SELECT COUNT(*) FROM beacons')
    beacons_count = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM animal_movements WHERE is_unusual = 1')
    unusual_animals = c.fetchone()[0]
    conn.close()

    overall_score = int(round(avg_risk))
    if overall_score >= 80:
        overall_level = "Critical Risk"
    elif overall_score >= 60:
        overall_level = "High Risk"
    elif overall_score >= 30:
        overall_level = "Medium Risk"
    else:
        overall_level = "Low Risk"

    return jsonify({
        "success": True,
        "demo_mode": True,
        "name": "ForestGuard",
        "version": "1.0.0",
        "overall_risk_score": overall_score,
        "overall_risk_level": overall_level,
        "high_risk_zones_count": high_risk_zones,
        "active_alerts_count": active_alerts,
        "active_beacons_count": beacons_count,
        "unusual_animal_detections": unusual_animals,
        "alarm_active": alarm_state["active"],
        "alarm_info": alarm_state
    })

@app.route('/api/zones', methods=['GET'])
def get_zones():
    conn = get_db()
    zones = [dict(row) for row in conn.execute('SELECT * FROM zones').fetchall()]
    conn.close()
    for z in zones:
        z['animal_anomaly'] = bool(z['animal_anomaly'])
    return jsonify({"success": True, "count": len(zones), "data": zones})

@app.route('/api/zones/<zone_id>', methods=['GET'])
def get_zone_by_id(zone_id):
    conn = get_db()
    row = conn.execute('SELECT * FROM zones WHERE id = ?', (zone_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"success": False, "error": "Zone not found"}), 404
    z = dict(row)
    z['animal_anomaly'] = bool(z['animal_anomaly'])
    return jsonify({"success": True, "data": z})

@app.route('/api/risk', methods=['POST'])
def calculate_risk_endpoint():
    try:
        data = request.get_json() or {}
        # Validate inputs
        temp = float(data.get('temperature', 25.0))
        humidity = float(data.get('humidity', 50.0))
        wind_speed = float(data.get('wind_speed', 15.0))
        rainfall = float(data.get('rainfall', 5.0))
        veg_dryness = float(data.get('vegetation_dryness', 45.0))
        fire_freq = float(data.get('historical_frequency', 1.0))
        animal_anomaly = bool(data.get('animal_anomaly', False))

        # Clamp ranges
        temp = max(-10.0, min(60.0, temp))
        humidity = max(0.0, min(100.0, humidity))
        wind_speed = max(0.0, min(150.0, wind_speed))
        rainfall = max(0.0, min(300.0, rainfall))
        veg_dryness = max(0.0, min(100.0, veg_dryness))
        fire_freq = max(0.0, min(20.0, fire_freq))

        result = calculate_fire_risk(temp, humidity, wind_speed, rainfall, veg_dryness, fire_freq, animal_anomaly)

        # Log prediction to database
        conn = get_db()
        conn.execute('''
        INSERT INTO risk_predictions (zone_id, temperature, humidity, wind_speed, rainfall_7d, vegetation_dryness, fire_frequency_5y, calculated_score, risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('zone_id', 'MANUAL_TEST'), temp, humidity, wind_speed, rainfall, int(veg_dryness), int(fire_freq),
            result['score'], result['level']
        ))
        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "data": result,
            "inputs": {
                "temperature": temp,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "rainfall": rainfall,
                "vegetation_dryness": veg_dryness,
                "historical_frequency": fire_freq,
                "animal_anomaly": animal_anomaly
            }
        })
    except (ValueError, TypeError) as e:
        return jsonify({"success": False, "error": f"Invalid numerical inputs: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Server error: {str(e)}"}), 500

@app.route('/api/alerts', methods=['GET', 'POST'])
def handle_alerts():
    if request.method == 'GET':
        conn = get_db()
        alerts = [dict(row) for row in conn.execute('SELECT * FROM alerts ORDER BY risk_score DESC').fetchall()]
        conn.close()
        return jsonify({"success": True, "count": len(alerts), "data": alerts})
    else:
        # Create new alert
        data = request.get_json() or {}
        alert_id = f"ALT-MANUAL-{int(datetime.now().timestamp())}"
        zone_id = data.get('zone_id', 'Z-01')
        zone_name = data.get('zone_name', 'Manual Sector')
        severity = data.get('severity', 'High')
        risk_score = int(data.get('risk_score', 75))
        title = data.get('title', 'Manual Fire Advisory')
        reason = data.get('reason', 'User simulated high fire risk trigger')
        recommended_action = data.get('recommended_action', 'Evacuate sector and alert rangers')

        conn = get_db()
        conn.execute('''
        INSERT INTO alerts (id, zone_id, zone_name, severity, risk_score, title, reason, recommended_action, timestamp, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (alert_id, zone_id, zone_name, severity, risk_score, title, reason, recommended_action, 'Just now', 'Active'))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Alert created", "id": alert_id}), 201

@app.route('/api/animals', methods=['GET'])
def get_animals():
    conn = get_db()
    animals = [dict(row) for row in conn.execute('SELECT * FROM animal_movements ORDER BY is_unusual DESC, speed_kmh DESC').fetchall()]
    conn.close()
    for a in animals:
        a['is_unusual'] = bool(a['is_unusual'])
    return jsonify({"success": True, "count": len(animals), "data": animals})

@app.route('/api/beacons', methods=['GET'])
def get_beacons():
    conn = get_db()
    beacons = [dict(row) for row in conn.execute('SELECT * FROM beacons').fetchall()]
    conn.close()
    for b in beacons:
        b['strobe_active'] = bool(b['strobe_active'])
        b['speaker_active'] = bool(b['speaker_active'])
        try:
            b['guidance_steps'] = json.loads(b['guidance_steps']) if b.get('guidance_steps') else []
        except Exception:
            b['guidance_steps'] = []
    return jsonify({"success": True, "count": len(beacons), "data": beacons})

@app.route('/api/beacons/<beacon_id>/trigger', methods=['POST'])
def trigger_beacon(beacon_id):
    conn = get_db()
    row = conn.execute('SELECT * FROM beacons WHERE id = ?', (beacon_id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": "Beacon not found"}), 404

    # Toggle beacon alarm mode
    new_status = "Alarm Activated" if row['status'] != "Alarm Activated" else "Active Warning"
    strobe = 1
    speaker = 1 if new_status == "Alarm Activated" else 0

    conn.execute('''
    UPDATE beacons SET status = ?, strobe_active = ?, speaker_active = ? WHERE id = ?
    ''', (new_status, strobe, speaker, beacon_id))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Beacon {beacon_id} updated",
        "status": new_status,
        "strobe_active": bool(strobe),
        "speaker_active": bool(speaker)
    })

@app.route('/api/alarm/toggle', methods=['POST'])
def toggle_emergency_alarm():
    data = request.get_json() or {}
    enable = data.get('active', not alarm_state["active"])
    zone = data.get('zone', "Pine Ridge Sector Alpha")

    alarm_state["active"] = bool(enable)
    alarm_state["triggered_at"] = datetime.now().isoformat() if enable else None
    alarm_state["triggered_by"] = "Dashboard Operator" if enable else None
    alarm_state["zone"] = zone

    return jsonify({
        "success": True,
        "alarm_active": alarm_state["active"],
        "zone": alarm_state["zone"],
        "message": "EMERGENCY ALARM ACTIVATED" if alarm_state["active"] else "Alarm Silenced"
    })

if __name__ == '__main__':
    init_db()
    print("ForestGuard Flask server starting on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
