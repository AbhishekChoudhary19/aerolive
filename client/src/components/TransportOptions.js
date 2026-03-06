import React from 'react';
import { useFlights } from '../context/FlightContext';

const TransportOptions = () => {
  const { selectedFlight } = useFlights();

  // Pick realistic base values to randomize slightly
  const basePrice = Math.floor(Math.random() * 500) + 300; // ₹300-800
  const destName = selectedFlight?.arrival?.iata || 'Dest';
  
  // Show only if a flight is actively selected
  if (!selectedFlight) {
    return (
      <div className="mt-8 pt-8 border-t border-white/10">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
          <i className="fa-solid fa-car text-sky-400"></i> Onward Travel
        </h3>
        <p className="text-sm text-zinc-500">Select a flight on the map to view instant transit options from its destination airport.</p>
      </div>
    );
  }

  const transportData = [
    {
      id: 'metro',
      title: 'Airport Metro / Rail',
      icon: 'fa-train-subway',
      color: 'text-fuchsia-400 bg-fuchsia-400/20',
      wait: 'Next train in 8 min',
      price: '₹60',
      tags: ['FASTEST', 'NO TRAFFIC'],
      action: 'View Map'
    },
    {
      id: 'ride',
      title: 'Uber / Ride App',
      icon: 'fa-car-side',
      color: 'text-sky-400 bg-sky-400/20',
      wait: '3-5 min wait',
      price: `₹${basePrice + 150} - ₹${basePrice + 350}`,
      tags: ['DOOR-TO-DOOR'],
      action: 'Book Ride'
    },
    {
      id: 'taxi',
      title: 'Premium Airport Taxi',
      icon: 'fa-taxi',
      color: 'text-amber-400 bg-amber-400/20',
      wait: 'Available at Gate 4',
      price: `₹${basePrice + 600} Flat`,
      tags: ['COMFORT', 'FIXED FARE'],
      action: 'Pre-book'
    },
    {
      id: 'rental',
      title: 'Self-Drive Rental',
      icon: 'fa-key',
      color: 'text-emerald-400 bg-emerald-400/20',
      wait: 'Pickup at Terminal B',
      price: 'From ₹1,500/day',
      tags: ['FREEDOM', '24 HRS'],
      action: 'Browse Cars'
    }
  ];

  return (
    <div className="mt-8 pt-8 border-t border-white/10 animate-fade-in">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
            <i className="fa-solid fa-location-dot text-sky-400"></i>
            Onward Travel from {destName}
          </h3>
          <p className="text-sm text-zinc-400">Live transport options & estimated prices upon landing.</p>
        </div>
        <button className="text-sky-400 text-sm font-semibold hover:text-sky-300 transition-colors hidden sm:block">
          All Transit Options →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {transportData.map(mode => (
          <div key={mode.id} className="glass rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-all group hover:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${mode.color}`}>
                <i className={`fa-solid ${mode.icon}`}></i>
              </div>
              <div className="flex gap-1 flex-col items-end">
                {mode.tags.map(t => (
                  <span key={t} className="text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-zinc-300 tracking-wider">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <h4 className="font-semibold text-lg mb-1">{mode.title}</h4>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
              <i className="fa-regular fa-clock"></i> {mode.wait}
            </div>

            <div className="flex items-end justify-between mt-auto">
              <div>
                <div className="text-xs text-zinc-500 font-medium mb-0.5">ESTIMATED</div>
                <div className="text-xl font-bold text-white">{mode.price}</div>
              </div>
              
              <button className="bg-white hover:bg-zinc-200 text-zinc-900 px-4 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-lg shadow-white/10">
                {mode.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportOptions;
