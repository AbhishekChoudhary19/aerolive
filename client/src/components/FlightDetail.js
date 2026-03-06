import React, { useEffect, useState } from 'react';
import { useFlights } from '../context/FlightContext';

const FlightDetail = ({ showToast }) => {
  const { selectedFlight, setSelectedFlight } = useFlights();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (selectedFlight) {
      setProgress(0);
      setTimeout(() => setProgress(Math.floor(Math.random() * 60) + 20), 300);
    }
  }, [selectedFlight]);

  if (!selectedFlight) return null;

  const f = selectedFlight;
  const callsign = f.callsign || f.flightNumber || f.icao24;
  const alt = f.baroAltitude ? `${Math.round(f.baroAltitude).toLocaleString()} m` : (f.live?.altitude ? `${Math.round(f.live.altitude).toLocaleString()} ft` : 'N/A');
  const speed = f.velocity ? `${Math.round(f.velocity * 3.6)} km/h` : (f.live?.speed ? `${Math.round(f.live.speed)} km/h` : 'N/A');
  const track = f.trueTrack ? `${Math.round(f.trueTrack)}°` : '—';
  const vr = f.verticalRate ? `${f.verticalRate > 0 ? '↑' : '↓'} ${Math.abs(Math.round(f.verticalRate))} m/s` : '—';

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md glass-dark z-[3000] overflow-y-auto shadow-2xl border-l border-white/10 transition-transform duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">{f.airline || f.originCountry || 'Unknown Airline'}</div>
            <h2 className="logo-font text-4xl font-bold text-sky-400">{callsign}</h2>
          </div>
          <button onClick={() => setSelectedFlight(null)}
            className="w-10 h-10 glass rounded-2xl flex items-center justify-center hover:bg-white/15 transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Route */}
        {f.departure?.iata && f.arrival?.iata && (
          <div className="glass rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{f.departure.iata}</div>
                <div className="text-xs text-zinc-400 mt-1">{f.departure.airport || f.departure.iata}</div>
                <div className="text-sm text-emerald-400 mt-1">{f.departure.scheduled || f.departure.actual || '—'}</div>
              </div>
              <div className="flex-1 mx-4 flex flex-col items-center gap-1">
                <div className="text-sky-400 text-xl">✈</div>
                <div className="w-full h-px bg-white/10"></div>
                <div className="text-xs text-zinc-500">{progress}% complete</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{f.arrival.iata}</div>
                <div className="text-xs text-zinc-400 mt-1">{f.arrival.airport || f.arrival.iata}</div>
                <div className="text-sm text-violet-400 mt-1">{f.arrival.scheduled || f.arrival.estimated || '—'}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Live stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'ALTITUDE', value: alt, icon: 'fa-mountain', color: 'text-sky-400' },
            { label: 'SPEED', value: speed, icon: 'fa-gauge-high', color: 'text-violet-400' },
            { label: 'TRACK', value: track, icon: 'fa-compass', color: 'text-amber-400' },
            { label: 'VERT RATE', value: vr, icon: 'fa-arrow-up', color: 'text-emerald-400' }
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className={`fa-solid ${icon} text-xs ${color}`}></i>
                <span className="text-xs text-zinc-400 tracking-widest">{label}</span>
              </div>
              <div className={`text-xl font-semibold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Aircraft info */}
        {f.aircraft?.model && (
          <div className="glass rounded-2xl p-4 mb-4">
            <div className="text-xs text-zinc-400 mb-2 tracking-widest">AIRCRAFT</div>
            <div className="font-semibold">{f.aircraft.model}</div>
            {f.aircraft.registration && <div className="text-sm text-zinc-400 font-mono">{f.aircraft.registration}</div>}
          </div>
        )}

        {/* Status */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 tracking-widest">STATUS</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${f.onGround ? 'bg-zinc-500/20 text-zinc-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {f.onGround ? 'ON GROUND' : 'AIRBORNE'}
            </span>
          </div>
          {f.squawk && (
            <div className="mt-2 text-xs text-zinc-500">Squawk: <span className="font-mono text-zinc-300">{f.squawk}</span></div>
          )}
        </div>

        {/* Timeline */}
        <div className="glass rounded-2xl p-4 mb-5">
          <div className="text-xs text-zinc-400 tracking-widest mb-4">TIMELINE</div>
          <div className="space-y-3">
            {f.departure?.iata && (
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-400 flex-shrink-0 mt-0.5"></div>
                <div>
                  <div className="font-medium text-sm">Departed {f.departure.iata}</div>
                  <div className="text-xs text-zinc-400">{f.departure.scheduled || '—'}</div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-400 flex-shrink-0 mt-0.5"></div>
              <div>
                <div className="font-medium text-sm">Cruising</div>
                <div className="text-xs text-zinc-400">{alt} • {speed}</div>
              </div>
            </div>
            {f.arrival?.iata && (
              <div className="flex gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full bg-white/20 flex-shrink-0 mt-0.5"></div>
                <div>
                  <div className="font-medium text-sm">Arriving {f.arrival.iata}</div>
                  <div className="text-xs text-zinc-400">ETA {f.arrival.scheduled || f.arrival.estimated || '—'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => showToast(`Alert set for ${callsign}`, 2000)}
            className="flex-1 py-3 glass rounded-2xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <i className="fa-solid fa-bell text-amber-400"></i> Set Alert
          </button>
          <button onClick={() => showToast(`${callsign} saved to favourites`, 2000)}
            className="flex-1 py-3 glass rounded-2xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <i className="fa-solid fa-bookmark text-sky-400"></i> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightDetail;
