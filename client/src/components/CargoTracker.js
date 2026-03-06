import React, { useState } from 'react';
import { cargoAPI } from '../services/api';

const statusMap = {
  booked: { label: 'Booked', color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
  accepted: { label: 'Accepted', color: 'text-sky-400', bg: 'bg-sky-400/10' },
  loaded: { label: 'Loaded', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  in_transit: { label: 'In Transit', color: 'text-violet-400', bg: 'bg-violet-400/10' },
  arrived: { label: 'Arrived', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  delivered: { label: 'Delivered', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  held: { label: 'On Hold', color: 'text-red-400', bg: 'bg-red-400/10' }
};

const CargoTracker = ({ showToast }) => {
  const [awb, setAwb] = useState('AWB998877665');
  const [cargo, setCargo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    const id = awb.trim().toUpperCase();
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await cargoAPI.getByAWB(id);
      setCargo(res.data.data);
    } catch (err) {
      setError('AWB not found. Try AWB998877665 or AWB123456789');
      setCargo(null);
    } finally {
      setLoading(false);
    }
  };

  const st = cargo ? (statusMap[cargo.status] || statusMap.booked) : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6">📦</div>
        <h2 className="logo-font text-4xl font-bold mb-2">Cargo & Parcel Tracking</h2>
        <p className="text-zinc-400">Real-time AWB tracking for air freight and parcels</p>
      </div>

      {/* Search */}
      <div className="glass rounded-3xl p-8 mb-8">
        <div className="flex gap-4">
          <input
            value={awb}
            onChange={e => setAwb(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTrack()}
            type="text"
            placeholder="Enter AWB number..."
            className="flex-1 bg-white/10 text-2xl placeholder-zinc-500 rounded-2xl px-6 py-5 outline-none border border-white/10 focus:border-emerald-400 transition-all"
          />
          <button
            onClick={handleTrack}
            disabled={loading}
            className="px-8 py-5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-2xl font-semibold text-lg transition-colors flex items-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <i className="fa-solid fa-magnifying-glass"></i>}
            TRACK
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <span className="text-xs text-zinc-500">Try:</span>
          {['AWB998877665', 'AWB123456789'].map(a => (
            <button key={a} onClick={() => setAwb(a)}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">{a}</button>
          ))}
        </div>

        {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
      </div>

      {/* Result */}
      {cargo && (
        <div className="glass rounded-3xl p-8 animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-xs text-zinc-400 tracking-widest mb-1">AIR WAYBILL</div>
              <div className="font-mono text-3xl font-bold text-emerald-400">{cargo.awb}</div>
            </div>
            <div className={`px-4 py-2 rounded-2xl text-sm font-bold ${st.bg} ${st.color}`}>
              {st.label}
            </div>
          </div>

          {/* Route */}
          <div className="glass rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{cargo.origin?.iata}</div>
                <div className="text-xs text-zinc-400">{cargo.origin?.city}</div>
              </div>
              <div className="flex-1 mx-6 text-center">
                <div className="parcel-plane text-2xl">📦✈️</div>
                <div className="text-xs text-zinc-500 mt-1">{cargo.progress || 0}% complete</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{cargo.destination?.iata}</div>
                <div className="text-xs text-zinc-400">{cargo.destination?.city}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full progress-bar"
                     style={{ width: `${cargo.progress || 0}%` }}></div>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'WEIGHT', value: `${cargo.weight} kg` },
              { label: 'PIECES', value: cargo.pieces },
              { label: 'FLIGHT', value: cargo.linkedFlight || '—', color: 'text-sky-400' },
              { label: 'COMMODITY', value: cargo.commodity || 'General' }
            ].map(({ label, value, color }) => (
              <div key={label} className="glass rounded-2xl p-4 text-center">
                <div className="text-xs text-zinc-400 tracking-widest mb-1">{label}</div>
                <div className={`font-semibold ${color || 'text-white'}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Events timeline */}
          {cargo.events && cargo.events.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 tracking-widest mb-4">TRACKING HISTORY</h3>
              <div className="space-y-3">
                {[...cargo.events].reverse().map((ev, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${i === 0 ? 'bg-emerald-400' : 'bg-zinc-600'}`}></div>
                    <div>
                      <div className="text-sm font-medium">{ev.description}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {ev.airport} • {new Date(ev.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipper / consignee */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="glass rounded-2xl p-4">
              <div className="text-xs text-zinc-400 tracking-widest mb-1">SHIPPER</div>
              <div className="text-sm">{cargo.shipper}</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-xs text-zinc-400 tracking-widest mb-1">CONSIGNEE</div>
              <div className="text-sm">{cargo.consignee}</div>
            </div>
          </div>

          {cargo.eta && (
            <div className="mt-4 glass rounded-2xl p-4 text-center">
              <div className="text-xs text-zinc-400 tracking-widest mb-1">ESTIMATED DELIVERY</div>
              <div className="text-xl font-semibold text-violet-400">
                {new Date(cargo.eta).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CargoTracker;
