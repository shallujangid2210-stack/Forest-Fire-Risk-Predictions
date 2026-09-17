import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Thermometer, 
  Droplets, 
  Wind, 
  Clock, 
  Radio, 
  Activity, 
  AlertTriangle,
  ZoomIn,
  Search,
  Filter,
  Sparkles,
  TreePine,
  Volume2
} from 'lucide-react';
import { ForestZone, SafetyBeacon, AnimalMovement } from '../types';

interface RiskMapProps {
  zones: ForestZone[];
  beacons: SafetyBeacon[];
  animals: AnimalMovement[];
  selectedZone: ForestZone | null;
  onSelectZone: (zone: ForestZone | null) => void;
  onTriggerEvacuation?: (zoneName: string) => void;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  zones,
  beacons,
  animals,
  selectedZone,
  onSelectZone,
  onTriggerEvacuation
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBeacons, setShowBeacons] = useState<boolean>(true);
  const [showAnimals, setShowAnimals] = useState<boolean>(true);
  const [tileError, setTileError] = useState<boolean>(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Yosemite / Sierra Nevada national forest coordinates
      const map = L.map(mapContainerRef.current, {
        center: [37.745, -119.585],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap standard tile layer
      const osmTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      });

      osmTileLayer.on('tileerror', () => {
        setTileError(true);
      });

      osmTileLayer.addTo(map);

      // Markers layer group
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Force size recalculation to prevent grey tile artifacts
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      const handleResize = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map layers when zones, beacons, or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Color mapper for zone risk levels
    const getZoneColor = (level: string) => {
      switch (level) {
        case 'Critical': return '#ef4444';
        case 'High': return '#f97316';
        case 'Medium': return '#eab308';
        case 'Low':
        default: return '#22c55e';
      }
    };

    // Filter zones
    const filteredZones = zones.filter(z => {
      const matchFilter = filterLevel === 'All' || z.risk_level === filterLevel;
      const matchSearch = z.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });

    // Render Zone Circles
    filteredZones.forEach(zone => {
      const color = getZoneColor(zone.risk_level);
      const isSelected = selectedZone?.id === zone.id;

      // Circle representing zone area
      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        color: color,
        weight: isSelected ? 3 : 2,
        opacity: 0.9,
        fillColor: color,
        fillOpacity: zone.risk_level === 'Critical' ? 0.35 : 0.22,
        dashArray: zone.risk_level === 'Critical' ? '6, 6' : undefined,
      });

      circle.on('click', () => {
        onSelectZone(zone);
      });

      // Custom HTML Marker for the zone center
      const iconHtml = `
        <div style="
          background-color: ${color};
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 11px;
          font-family: sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          border: 2px solid white;
          cursor: pointer;
          transform: translate(-50%, -50%);
          ${zone.risk_level === 'Critical' ? 'animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;' : ''}
        ">
          ${zone.risk_score}
        </div>
      `;

      const zoneIcon = L.divIcon({
        className: 'custom-zone-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([zone.lat, zone.lng], { icon: zoneIcon });
      marker.on('click', () => {
        onSelectZone(zone);
      });

      circle.addTo(markersGroup);
      marker.addTo(markersGroup);
    });

    // Render Solar Beacons
    if (showBeacons) {
      beacons.forEach(b => {
        const isAlarm = b.status === 'Alarm Activated';
        const beaconIcon = L.divIcon({
          className: 'beacon-marker',
          html: `
            <div style="
              background-color: ${isAlarm ? '#ef4444' : '#0284c7'};
              color: white;
              padding: 3px 6px;
              border-radius: 6px;
              font-size: 10px;
              font-weight: bold;
              border: 1px solid white;
              display: flex;
              align-items: center;
              gap: 3px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.6);
              white-space: nowrap;
            ">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;"></span>
              ${b.id}
            </div>
          `,
          iconAnchor: [20, 10]
        });

        const beaconMarker = L.marker([b.lat, b.lng], { icon: beaconIcon });
        beaconMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <b style="color: #0f172a;">${b.name} (${b.id})</b><br/>
            <span style="font-size: 11px; color: #475569;">Battery: ${b.battery_pct}% (Solar)</span><br/>
            <span style="font-size: 11px; color: ${isAlarm ? '#ef4444' : '#0284c7'}; font-weight: bold;">Status: ${b.status}</span>
          </div>
        `);
        beaconMarker.addTo(markersGroup);
      });
    }

    // Render Animal Sightings (approx coordinate within zone)
    if (showAnimals) {
      animals.forEach((a, idx) => {
        const targetZone = zones.find(z => z.id === a.zone_id);
        if (!targetZone) return;

        // Slight offset from center for visual distribution
        const offsetLat = targetZone.lat + (idx % 2 === 0 ? 0.006 : -0.006);
        const offsetLng = targetZone.lng + (idx % 3 === 0 ? 0.007 : -0.005);

        const animalIcon = L.divIcon({
          className: 'animal-marker',
          html: `
            <div style="
              background-color: ${a.is_unusual ? '#dc2626' : '#059669'};
              color: white;
              padding: 2px 5px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 700;
              border: 1px solid rgba(255,255,255,0.8);
              box-shadow: 0 2px 5px rgba(0,0,0,0.5);
              white-space: nowrap;
            ">
              🐾 ${a.species.split(' ')[0]} ${a.is_unusual ? '⚡' : ''}
            </div>
          `,
          iconAnchor: [25, 10]
        });

        const animalMarker = L.marker([offsetLat, offsetLng], { icon: animalIcon });
        animalMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <b style="color: #0f172a;">${a.species}</b><br/>
            <span style="font-size: 11px; color: ${a.is_unusual ? '#dc2626' : '#059669'}; font-weight: bold;">
              ${a.movement_status} (${a.speed_kmh} km/h)
            </span><br/>
            <span style="font-size: 10px; color: #64748b;">${a.direction}</span>
          </div>
        `);
        animalMarker.addTo(markersGroup);
      });
    }
  }, [zones, beacons, animals, filterLevel, searchQuery, showBeacons, showAnimals, selectedZone]);

  // Center on selected zone if changed externally
  useEffect(() => {
    if (selectedZone && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedZone.lat, selectedZone.lng], 13, {
        duration: 1.2
      });
    }
  }, [selectedZone]);

  const handleFocusCritical = () => {
    const critical = zones.find(z => z.risk_level === 'Critical') || zones[0];
    if (critical && mapInstanceRef.current) {
      onSelectZone(critical);
      mapInstanceRef.current.flyTo([critical.lat, critical.lng], 14, { duration: 1 });
    }
  };

  const handleResetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([37.745, -119.585], 12, { duration: 1 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Controls Bar */}
      <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/70 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search forest zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filterLevel === level
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Map Layer Toggles & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBeacons(!showBeacons)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${
              showBeacons
                ? 'bg-sky-950/60 text-sky-300 border-sky-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>Solar Beacons</span>
          </button>

          <button
            onClick={() => setShowAnimals(!showAnimals)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${
              showAnimals
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Wildlife Pins</span>
          </button>

          <button
            onClick={handleFocusCritical}
            className="px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-500/40 text-xs font-bold transition flex items-center space-x-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Focus Critical</span>
          </button>

          <button
            onClick={handleResetMapView}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
            title="Reset Map Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map Canvas & Sidebar Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Display (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-slate-700/70 shadow-xl relative min-h-[460px] lg:min-h-[580px] bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full min-h-[460px] lg:min-h-[580px]" />

          {/* Map Legend Overlay */}
          <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/70 shadow-lg text-xs space-y-1.5">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Risk Severity</span>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 border border-white/50" />
              <span className="text-slate-200">Critical Risk (80–100)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 border border-white/50" />
              <span className="text-slate-200">High Risk (60–79)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500 border border-white/50" />
              <span className="text-slate-200">Medium Risk (30–59)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white/50" />
              <span className="text-slate-200">Low Risk (0–29)</span>
            </div>
          </div>

          {/* Offline / Demo Notice */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-slate-400">
            <span>Leaflet.js + OpenStreetMap Engine &bull; Click any zone for telemetry</span>
          </div>
        </div>

        {/* Selected Zone Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 shadow-xl flex flex-col justify-between">
          {selectedZone ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-700/60">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Sector ID: {selectedZone.id}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit',sans-serif]">
                    {selectedZone.name}
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                  selectedZone.risk_level === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                  selectedZone.risk_level === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                  selectedZone.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                }`}>
                  {selectedZone.risk_score} - {selectedZone.risk_level}
                </span>
              </div>

              {/* Status Notice */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span>Advisory Status:</span>
                  <span className="font-bold text-white">{selectedZone.status}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Vegetation Fuel:</span>
                  <span className="font-medium text-amber-300">{selectedZone.dominant_fuel}</span>
                </div>
              </div>

              {/* Telemetry Metrics Grid (Required by prompt: Temp, Humidity, Wind speed, Last updated) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                    <Thermometer className="w-3.5 h-3.5 text-red-400" />
                    <span>Temperature</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {selectedZone.temperature}°C
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {selectedZone.humidity}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                    <Wind className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Wind Speed</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {selectedZone.wind_speed} km/h
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Last Updated</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    {selectedZone.last_updated}
                  </div>
                </div>
              </div>

              {/* Animal Telemetry in this zone */}
              {selectedZone.animal_anomaly ? (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200">
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>Wildlife Flight Anomaly Active</span>
                  </div>
                  <p className="text-[11px] text-rose-300/80">
                    Animal bio-sensors indicate erratic displacement away from northeastern ridge.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
                  <span>Wildlife telemetry indicates normal peaceful grazing in this sector.</span>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2">
                {onTriggerEvacuation && (
                  <button
                    onClick={() => onTriggerEvacuation(selectedZone.name)}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950 transition flex items-center justify-center space-x-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Trigger Sector Evacuation Siren</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-700">
                <MapPin className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Select a Forest Zone</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Click any colored zone circle on the Leaflet map to inspect real-time micro-weather telemetry and evacuation status.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Zones Loaded: {zones.length}</span>
            <span className="text-emerald-400 font-semibold">GPS Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
