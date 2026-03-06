import React, { useState, useEffect } from 'react';
import { useFlights } from '../context/FlightContext';
import { cargoAPI } from '../services/api';

const Hero = ({ showToast }) => {
  const { flights, stats, loadFlight, loadFlightsByRoute, setSelectedFlight, routeFilter, setRouteFilter } = useFlights();
  const [mode, setMode] = useState(0); // 0=flight, 1=route, 2=cargo
  const [flightInput, setFlightInput] = useState('');
  const [from, setFrom] = useState('BLR');
  const [to, setTo] = useState('DEL');
  const [awb, setAwb] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} IST`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTrackFlight = async () => {
    if (!flightInput.trim()) return;
    showToast(`Searching for ${flightInput.trim().toUpperCase()}...`, 1500);
    const f = await loadFlight(flightInput.trim().toUpperCase());
    if (f) {
      setSelectedFlight(f);
      showToast(`Tracking ${flightInput.toUpperCase()} live ✈️`, 2500);
      setFlightInput('');
    } else {
      showToast(`Flight ${flightInput.toUpperCase()} not found. Try one of the recent flights below.`, 3500);
    }
  };

  const handleTrackRoute = async () => {
    if (!from.trim() && !to.trim()) return;
    showToast(`Searching flights: ${from.toUpperCase() || 'Any'} → ${to.toUpperCase() || 'Any'}...`, 2000);
    const results = await loadFlightsByRoute(from.trim(), to.trim());
    if (results.length > 0) {
      showToast(`Found ${results.length} live flights on this route! ✈️`, 2500);
      // Scroll to map
      document.getElementById('live-map')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast(`No live flights found for ${from} → ${to} right now.`, 3000);
    }
  };

  const handleTrackCargo = async () => {
    const id = awb.trim().toUpperCase() || 'AWB998877665';
    try {
      await cargoAPI.getByAWB(id);
      showToast(`Live tracking started for ${id}`, 2500);
    } catch { showToast('AWB not found. Try AWB998877665', 2500); }
  };

  return (
    <div className="relative min-h-[88vh] flex items-center overflow-hidden">
      
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/HEADER-BG.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-zinc-950/70 z-0"></div>

      {/* Animated background glow */}
      <div className="absolute inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(circle at 30% 40%, rgba(56,189,248,0.1) 0%, transparent 60%)' }}></div>
      <div className="absolute inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(circle at 70% 60%, rgba(139,92,246,0.1) 0%, transparent 50%)' }}></div>

      <style>{`
        @keyframes flyAcross {
          from { transform: translateX(0) rotate(-5deg); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          to { transform: translateX(110vw) rotate(-5deg); opacity: 0; }
        }
      `}</style>

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-20 lg:pt-28 pb-16 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-medium px-5 py-2 rounded-3xl border border-white/20 mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full status-dot"></div>
              {flights.length > 0 ? `${flights.length} flights tracked live right now` : '1,284 flights + 87 cargo tracked live'}
            </div>

            <h1 className="logo-font text-6xl lg:text-7xl font-semibold tracking-tighter leading-none mb-6">
              TRACK ANY<br />FLIGHT OR<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #38bdf8, #818cf8)' }}>CARGO</span>
              <br />IN REAL TIME
            </h1>

            <p className="text-xl text-zinc-300 max-w-md">
              Live GPS • Weather • Delays • Gates • Baggage • AWB Cargo
            </p>

            <div className="flex gap-8 mt-12">
              <div>
                <div className="text-4xl font-semibold text-emerald-400">98.4%</div>
                <div className="text-xs tracking-widest text-zinc-500">ON-TIME RATE</div>
              </div>
              <div>
                <div className="text-4xl font-semibold text-amber-400">{stats.delayed || 47}</div>
                <div className="text-xs tracking-widest text-zinc-500">DELAYED</div>
              </div>
              <div>
                <div className="text-4xl font-semibold text-sky-400">{stats.cargo || 87}</div>
                <div className="text-xs tracking-widest text-zinc-500">CARGO IN AIR</div>
              </div>
            </div>
          </div>

          {/* Right: Search Card */}
          <div className="lg:col-span-7">
            <div className="glass rounded-3xl p-8 lg:p-10 shadow-2xl max-w-2xl mx-auto lg:ml-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-1 text-sm bg-white/5 rounded-2xl p-1">
                  {['Flight Number', 'Route', 'Cargo AWB'].map((label, i) => (
                    <button
                      key={i}
                      onClick={() => setMode(i)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${mode === i ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-zinc-400">{time}</div>
              </div>

              {/* Flight search */}
              {mode === 0 && (
                <div className="space-y-5">
                  <input
                    value={flightInput}
                    onChange={e => setFlightInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTrackFlight()}
                    type="text"
                    placeholder="AI101 • 6E456 • SG234"
                    className="w-full bg-white/10 text-3xl placeholder-zinc-500 rounded-3xl px-8 py-7 outline-none border border-white/10 focus:border-sky-400 transition-all"
                  />
                  <button
                    onClick={handleTrackFlight}
                    className="w-full py-6 rounded-3xl text-xl font-semibold flex items-center justify-center gap-3 transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #0ea5e9, #7c3aed)' }}
                  >
                    <i className="fa-solid fa-paper-plane"></i> TRACK FLIGHT NOW
                  </button>
                </div>
              )}

              {/* Route search */}
              {mode === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-2">FROM</label>
                      <input value={from} onChange={e => setFrom(e.target.value)} type="text"
                        className="w-full bg-white/10 text-3xl placeholder-zinc-500 rounded-3xl px-6 py-6 outline-none border border-white/10" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-2">TO</label>
                      <input value={to} onChange={e => setTo(e.target.value)} type="text"
                        className="w-full bg-white/10 text-3xl placeholder-zinc-500 rounded-3xl px-6 py-6 outline-none border border-white/10" />
                    </div>
                  </div>
                  <button
                    onClick={handleTrackRoute}
                    className="w-full py-6 rounded-3xl text-xl font-semibold flex items-center justify-center gap-3 transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #0ea5e9, #7c3aed)' }}
                  >
                    SHOW LIVE FLIGHTS
                  </button>
                  {(routeFilter.from || routeFilter.to) && (
                    <button 
                      onClick={() => { setRouteFilter({ from: '', to: '' }); showToast('Route filter cleared', 1500); }}
                      className="w-full py-3 text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                      CLEAR ROUTE FILTER
                    </button>
                  )}
                </div>
              )}

              {/* Cargo search */}
              {mode === 2 && (
                <div className="space-y-5">
                  <input
                    value={awb}
                    onChange={e => setAwb(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTrackCargo()}
                    type="text"
                    placeholder="AWB998877665"
                    className="w-full bg-white/10 text-3xl placeholder-zinc-500 rounded-3xl px-8 py-7 outline-none border border-white/10 focus:border-emerald-400 transition-all"
                  />
                  <button
                    onClick={handleTrackCargo}
                    className="w-full py-6 rounded-3xl text-xl font-semibold flex items-center justify-center gap-3 transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #10b981, #0d9488)' }}
                  >
                    <i className="fa-solid fa-box"></i> TRACK CARGO NOW
                  </button>
                </div>
              )}

              {/* Quick access */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-zinc-400 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-history"></i> RECENT
                </p>
                <div className="flex flex-wrap gap-2">
                  {['AI101', '6E456', 'SG234'].map(f => (
                    <button key={f} onClick={() => { setFlightInput(f); setMode(0); }}
                      className="glass text-sm px-4 py-2 rounded-3xl hover:bg-white/20 transition-colors">{f}</button>
                  ))}
                  <button onClick={() => { setAwb('AWB998877665'); setMode(2); }}
                    className="glass text-sm px-4 py-2 rounded-3xl hover:bg-white/20 transition-colors text-emerald-400">
                    AWB998877665
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
