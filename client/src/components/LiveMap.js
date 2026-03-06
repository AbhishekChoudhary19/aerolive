import React, { useEffect, useRef, useState } from 'react';
import { useFlights } from '../context/FlightContext';

let L;

const LiveMap = ({ showToast }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const { flights, filteredFlights, selectedFlight, setSelectedFlight, loadFlight, loadTrack, connected } = useFlights();
  const [currentLayer, setCurrentLayer] = useState('street');
  const [showLayers, setShowLayers] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const activeTileRef = useRef(null);
  const routeLayerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false
    });

    const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    activeTileRef.current = streetLayer;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);
  }, []);

  // Handle Layer Changes
  useEffect(() => {
    if (!mapReady || !window.L || !mapInstanceRef.current) return;

    if (activeTileRef.current) {
      mapInstanceRef.current.removeLayer(activeTileRef.current);
    }

    const map = mapInstanceRef.current;

    if (currentLayer === 'street') {
      activeTileRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
    } else {
      activeTileRef.current = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '',
        maxZoom: 19
      }).addTo(map);
    }
  }, [currentLayer, mapReady]);

  // Keep track of the active selected flight globally for the leaflet hooks
  useEffect(() => {
    window.activeSelectedFlight = selectedFlight;
  }, [selectedFlight]);

  // Handle Flight Route Drawing (Trajectory)
  useEffect(() => {
    if (!mapReady || !window.L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const { getAirportCoordinates } = require('../utils/airports');

    const drawRoute = async () => {
      // Cleanup previous route layer
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      // Only draw if a flight is selected
      const currentFlight = flights.find(f => window.selectedFlightIcao && f.icao24 === window.selectedFlightIcao) || window.activeSelectedFlight;
      if (!currentFlight) return;

      const routeGroup = L.layerGroup().addTo(map);
      routeLayerRef.current = routeGroup;

      const oriIata = currentFlight.departure?.iata;
      const dstIata = currentFlight.arrival?.iata;
      const oriCoords = getAirportCoordinates(oriIata);
      const dstCoords = getAirportCoordinates(dstIata);

      // Attempt to fetch actual track waypoints
      let waypoints = [];
      try {
        const trackData = await loadTrack(currentFlight.icao24);
        if (trackData && trackData.path && trackData.path.length > 0) {
          // OpenSky path: [time, lat, lon, alt, track, ground]
          waypoints = trackData.path
            .filter(p => p[1] !== null && p[2] !== null)
            .map(p => [p[1], p[2]]);
        }
      } catch (err) {
        console.warn('Could not fetch trajectory, falling back to straight line');
      }

      // Final latlngs to draw
      let drawPoints = waypoints;
      
      // Fallback to straight line if no waypoints
      if (drawPoints.length < 2) {
        const currentPos = [currentFlight.latitude, currentFlight.longitude];
        if (oriCoords) drawPoints.push(oriCoords);
        if (currentPos[0] && currentPos[1]) drawPoints.push(currentPos);
        if (dstCoords) drawPoints.push(dstCoords);
      }

      if (drawPoints.length >= 2) {
        // Draw the path
        L.polyline(drawPoints, {
          color: '#38bdf8',
          weight: 3,
          opacity: 0.8,
          dashArray: waypoints.length > 0 ? null : '10, 10', // Solid for actual track, dashed for fallback
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routeGroup);

        // Add Origin Marker
        if (oriCoords) {
          const time = currentFlight.departure?.scheduled || '--:--';
          const oriNode = L.divIcon({
            className: '',
            html: `
              <div style="background:rgba(9,9,11,0.9); border:2px solid #38bdf8; border-radius:12px; padding:4px 8px; font-family:Inter,sans-serif; color:white; font-size:10px; font-weight:bold; white-space:nowrap; box-shadow:0 0 10px rgba(56,189,248,0.5); transform:translate(-50%, -100%); margin-top:-10px;">
                <span style="color:#94a3b8">DEP</span> ${oriIata || 'Origin'} • <span style="color:#a78bfa">${time}</span>
              </div>
              <div style="width:10px; height:10px; background:#38bdf8; border-radius:50%; border:2px solid white; box-shadow:0 0 10px #38bdf8; margin:0 auto;"></div>
            `,
            iconSize: [0, 0]
          });
          L.marker(oriCoords, { icon: oriNode }).addTo(routeGroup);
        }

        // Add Destination Marker
        if (dstCoords) {
          const time = currentFlight.arrival?.scheduled || '--:--';
          const dstNode = L.divIcon({
            className: '',
            html: `
              <div style="background:rgba(9,9,11,0.9); border:2px solid #4ade80; border-radius:12px; padding:4px 8px; font-family:Inter,sans-serif; color:white; font-size:10px; font-weight:bold; white-space:nowrap; box-shadow:0 0 10px rgba(74,222,128,0.5); transform:translate(-50%, -100%); margin-top:-10px;">
                <span style="color:#94a3b8">ARR</span> ${dstIata || 'Dest'} • <span style="color:#4ade80">${time}</span>
              </div>
              <div style="width:10px; height:10px; background:#4ade80; border-radius:50%; border:2px solid white; box-shadow:0 0 10px #4ade80; margin:0 auto;"></div>
            `,
            iconSize: [0, 0]
          });
          L.marker(dstCoords, { icon: dstNode }).addTo(routeGroup);
        }
      }
    };

    drawRoute();
  }, [selectedFlight, flights, mapReady, loadTrack]);

  // Update markers when flights change
  useEffect(() => {
    if (!mapReady || !window.L || !flights.length) return;
    L = window.L;
    const map = mapInstanceRef.current;

    const currentIds = new Set(filteredFlights.map(f => f.icao24));

    // Remove stale markers
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        mapInstanceRef.current.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Add/update markers
    filteredFlights.forEach(flight => {
      if (!flight.latitude || !flight.longitude) return;

      const rotation = flight.trueTrack || 0;
      const speed = flight.velocity || 0;
      const alt = flight.baroAltitude || 0;

      // Color by airline or status
      let color = '#38bdf8'; // bright blue
      if (flight.onGround) color = '#a1a1aa'; // gray
      else if (alt > 10000) color = '#a78bfa'; // light purple
      else if (alt > 5000) color = '#38bdf8'; // light sky blue
      else color = '#4ade80'; // bright green

      const icon = L.divIcon({
        className: '',
        html: `<div style="transform:rotate(${rotation}deg); color:${color}; font-size:16px; transition:transform 0.5s; filter:drop-shadow(0 0 4px #000); text-shadow: 0 0 2px #000;">✈</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const label = flight.callsign || flight.flightNumber || flight.icao24;
      const tooltip = `
        <div style="background:rgba(9,9,11,0.9);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:10px 14px;font-family:Inter,sans-serif;font-size:12px;color:#f4f4f5;min-width:160px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);">
          <div style="font-weight:600;font-size:14px;color:#38bdf8">${label}</div>
          <div style="color:#a1a1aa;margin-top:4px">${flight.airline || flight.originCountry || ''}</div>
          <div style="margin-top:6px;display:flex;justify-content:space-between">
            <span>ALT</span><span style="font-weight:500;color:#e4e4e7">${alt ? Math.round(alt).toLocaleString() + ' m' : 'N/A'}</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span>SPD</span><span style="font-weight:500;color:#e4e4e7">${speed ? Math.round(speed * 3.6) + ' km/h' : 'N/A'}</span>
          </div>
          ${flight.departure?.iata && flight.arrival?.iata ? `<div style="margin-top:6px;color:#a1a1aa;font-weight:500">${flight.departure.iata} → ${flight.arrival.iata}</div>` : ''}
        </div>
      `;

      if (markersRef.current[flight.icao24]) {
        markersRef.current[flight.icao24].setLatLng([flight.latitude, flight.longitude]);
        markersRef.current[flight.icao24].setIcon(icon);
      } else {
        const marker = L.marker([flight.latitude, flight.longitude], { icon })
          .addTo(map)
          .bindTooltip(L.tooltip({ permanent: false, direction: 'top', opacity: 1, className: '' }).setContent(tooltip));

        marker.on('click', async () => {
          const detail = await loadFlight(flight.callsign || flight.icao24);
          if (detail) setSelectedFlight(detail);
          else setSelectedFlight(flight);
          showToast(`Tracking ${label}`, 2000);
        });

        markersRef.current[flight.icao24] = marker;
      }
    });
  }, [filteredFlights, mapReady, loadFlight, setSelectedFlight, showToast]);

  const flyToIndia = () => mapInstanceRef.current?.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
  const flyToWorld = () => mapInstanceRef.current?.flyTo([25, 75], 3, { duration: 1.5 });

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl relative border border-zinc-200/20" style={{ height: 680, background: '#18181b' }}>
      <div ref={mapRef} className="w-full h-full text-zinc-800" />

      {/* Map controls overlay */}
      <div className="absolute top-5 left-5 bg-zinc-950/90 backdrop-blur-md rounded-2xl p-4 w-64 z-[1000] shadow-2xl border border-white/10 text-zinc-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full status-dot ${connected ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
            <span className="text-xs font-semibold tracking-wide">{connected ? 'LIVE' : 'CACHED'} • {filteredFlights.length} AIRCRAFT</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 text-xs text-zinc-300 mt-2 border-t border-white/10 pt-3 font-medium">
          <div className="flex items-center gap-2"><span className="text-base" style={{ color: '#a78bfa', filter: 'drop-shadow(0 0 2px #000)' }}>✈</span> High altitude (&gt;10,000m)</div>
          <div className="flex items-center gap-2"><span className="text-base" style={{ color: '#38bdf8', filter: 'drop-shadow(0 0 2px #000)' }}>✈</span> Mid altitude</div>
          <div className="flex items-center gap-2"><span className="text-base" style={{ color: '#4ade80', filter: 'drop-shadow(0 0 2px #000)' }}>✈</span> Low altitude</div>
          <div className="flex items-center gap-2"><span className="text-base" style={{ color: '#a1a1aa', filter: 'drop-shadow(0 0 2px #000)' }}>✈</span> On ground</div>
        </div>
      </div>

      {/* Map nav buttons */}
      <div className="absolute top-5 right-5 flex flex-col items-end gap-2 z-[1000]">
        <button onClick={flyToIndia} className="bg-zinc-950/90 backdrop-blur-md text-zinc-100 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-zinc-900 transition-all shadow-xl border border-white/10 w-24">🇮🇳 India</button>
        <button onClick={flyToWorld} className="bg-zinc-950/90 backdrop-blur-md text-zinc-100 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-zinc-900 transition-all shadow-xl border border-white/10 w-24">🌍 World</button>

        {/* Layer Controls */}
        <div className="relative mt-2">
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="bg-zinc-950/90 backdrop-blur-md text-zinc-100 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-zinc-900 transition-all shadow-xl border border-white/10 flex items-center justify-center gap-2 w-24"
          >
            <i className="fa-solid fa-layer-group"></i> Layers
          </button>

          {showLayers && (
            <div className="absolute top-full right-0 mt-2 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 w-48 shadow-2xl flex flex-col gap-1 overflow-hidden">
              <button
                onClick={() => { setCurrentLayer('street'); setShowLayers(false); showToast('Switched to Street View', 1500); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${currentLayer === 'street' ? 'bg-sky-500/20 text-sky-400' : 'text-zinc-300 hover:bg-white/5'}`}
              >
                <i className="fa-solid fa-map"></i> Normal View
              </button>
              <button
                onClick={() => { setCurrentLayer('satellite'); setShowLayers(false); showToast('Switched to Satellite View', 1500); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${currentLayer === 'satellite' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-300 hover:bg-white/5'}`}
              >
                <i className="fa-solid fa-satellite"></i> Satellite
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-zinc-950/90 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-2.5 text-xs font-medium text-zinc-300 z-[1000] shadow-xl">
        Click any aircraft to view live details
      </div>
    </div>
  );
};

export default LiveMap;
