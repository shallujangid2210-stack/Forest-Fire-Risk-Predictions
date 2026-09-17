# ForestGuard – Forest Fire Risk Prediction & Monitoring System
**College Hackathon Project Prototype**

ForestGuard is an integrated wildfire risk prediction, real-time monitoring, and early warning platform designed to safeguard forests, wildlife, hikers, and local communities.

## Core Features
1. **Real-Time Risk Calculation**: Transparent multi-factor fire risk score (0-100) factoring in temperature, humidity, wind velocity, 7-day rainfall deficit, vegetation fuel dryness, historical fire frequency, and wildlife flight anomalies.
2. **Interactive Leaflet Risk Map**: Live visualization of forest sectors color-coded by Low, Medium, High, and Critical fire vulnerability with interactive sector telemetry inspectors.
3. **Animal Movement Anomaly Detection**: Bio-sensor tracking for wildlife (deer, elk, birds, wild boar). Sudden flight or mass herd dispersion away from remote canyons serves as a natural early warning before smoke is visible on satellite.
4. **Phone-Free Forest Safety Beacons**: Solar-powered LoRa/satellite mesh beacons providing emergency strobe lights, loud directional guidance, and offline evacuation instructions for hikers without cellular connectivity.
5. **Emergency Alarm & Broadcast System**: Interactive siren with synthesized audio alarms, visual flashing alerts, and rapid notification dispatching.
6. **Demo Mode**: Built-in offline simulation mode allowing full presentation and testing without requiring active internet or live external sensor hardware.

## Architecture
- **Web App Interface**: Modern TypeScript, Tailwind CSS, Leaflet.js, and Chart.js.
- **Backend**: Python Flask REST API with SQLite database (`zones`, `weather_data`, `risk_predictions`, `alerts`, `animal_movements`, `beacons`).
- **Audio Synthesis**: Web Audio API oscillator for instant, reliable browser siren alarm.

## Quick Start (Python Flask Local Run)
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the Flask server
python app.py
```
Open `http://localhost:5000` in your browser.
