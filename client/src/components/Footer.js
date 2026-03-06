import React from 'react';

const Footer = () => {
  return (
    <footer className="relative mt-8 mb-8 z-10">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="glass-dark sm:glass rounded-[2rem] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle glow effect behind the footer content */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          {/* Brand & Tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-violet-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                🛩️
              </div>
              <span className="logo-font text-4xl font-bold tracking-tighter bg-gradient-to-r from-sky-400 to-violet-500 bg-clip-text text-transparent">
                AeroLive
              </span>
            </div>
            
            <p className="text-zinc-400 mb-6 max-w-md text-lg leading-relaxed">
              Real-time flight tracking • Live cargo visibility • Powered by passion for aviation
            </p>
            
            <p className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500">
              Wherever you're headed — we help you to see the journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Explore</h3>
            <ul className="space-y-4 text-zinc-400">
              <li><a href="#" className="hover:text-sky-400 transition-colors flex items-center gap-2"><i className="fa-solid fa-map text-sm"></i> Live Map</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors flex items-center gap-2"><i className="fa-solid fa-plane-departure text-sm"></i> Find Flights</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors flex items-center gap-2"><i className="fa-solid fa-box text-sm"></i> Cargo Tracking</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors flex items-center gap-2"><i className="fa-solid fa-cloud-sun text-sm"></i> Airport Weather</a></li>
            </ul>
          </div>

          {/* Support & Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">About</h3>
            <ul className="space-y-4 text-zinc-400">
              <li><a href="#" className="hover:text-sky-400 transition-colors">About AeroLive</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
     </div>
    </footer>
  );
};

export default Footer;
