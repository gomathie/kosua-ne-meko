import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Ticket, ChevronRight, Compass, Sparkles, Flame, Clock } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

interface HeroProps {
  onOpenTickets: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTickets }) => {
  // Live Countdown Timer logic for SAT. 5TH SEPT. 2026
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(EVENT_DETAILS.targetDateISO).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-900/10 pt-8 pb-16 lg:py-20">
      
      {/* Background Aerial Landscape Styling & Clouds */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Flying Birds & Floating Chili Decor */}
      <div className="absolute top-10 right-10 md:right-24 z-10 pointer-events-none opacity-80 animate-pulse">
        <div className="text-4xl transform rotate-12">🌶️</div>
      </div>
      <div className="absolute top-28 right-6 md:right-16 z-10 pointer-events-none opacity-90 animate-bounce duration-1000">
        <div className="text-5xl transform -rotate-12">🌶️</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Banner Poster Canvas Frame */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-sky-400 via-sky-200 to-emerald-800 shadow-2xl border-4 border-white/80 p-6 sm:p-10 md:p-14 text-stone-900">
          
          {/* Backdrop Image Overlay simulating the flyer aerial view */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />

          {/* Organizer Header Tag */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur border border-amber-200 shadow-sm text-stone-800 text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
              <span>OFFICIAL EVENT LANDING PAGE</span>
              <span className="text-stone-300">|</span>
              <span className="text-orange-700 font-extrabold">ACCRA, GHANA</span>
            </div>

            {/* Countdown Box */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-stone-900/85 backdrop-blur text-white text-xs sm:text-sm font-mono border border-stone-700 shadow-lg">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-stone-300 font-sans font-medium text-xs hidden sm:inline">COUNTDOWN:</span>
              <div className="flex items-center gap-1.5 font-black text-amber-400">
                <span>{timeLeft.days}d</span>:
                <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
                <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
                <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          </div>

          {/* Hero Content Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Title & Date Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Event Main Typography */}
              <div className="space-y-1">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-orange-600 font-display drop-shadow-[0_4px_12px_rgba(234,88,12,0.3)] uppercase leading-none">
                  KOSUA <span className="text-orange-500">NE MEKO</span>
                </h1>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-800 tracking-tight font-display uppercase drop-shadow-sm">
                    HANGOUT 2.0
                  </span>
                  <span className="bg-orange-600 text-white text-xs sm:text-sm font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-md">
                    EDITION 2
                  </span>
                </div>
              </div>

              {/* Date Badge (Recreating Left Flyer Card) */}
              <div className="inline-block transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-stone-200 text-emerald-800 max-w-xs">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-orange-600 tracking-widest mb-1">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span>EVENT DATE</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-900 leading-none">
                    SAT. 5<span className="text-sm align-top">TH</span> SEPT.
                  </div>
                  <div className="text-3xl sm:text-4xl font-black tracking-widest text-emerald-800">
                    2026
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-stone-800 text-base sm:text-lg font-semibold max-w-xl leading-relaxed bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/60">
                Boiled farm eggs, freshly ground hot meko pepper salsa, live music, Ludo games & Accra street food culture! Join us for the most flavorful hangout of 2026.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenTickets}
                  className="px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-base sm:text-lg shadow-xl shadow-orange-600/40 hover:shadow-orange-600/60 transition-all hover:-translate-y-0.5 flex items-center gap-3 group"
                >
                  <Ticket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span>RESERVE PASS / TICKET</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#location"
                  className="px-6 py-4 rounded-2xl bg-white/90 hover:bg-white text-emerald-900 font-extrabold text-sm sm:text-base border border-emerald-700/20 shadow-md transition-all flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5 text-emerald-700" />
                  <span>GET LOCATION MAP</span>
                </a>
              </div>

            </div>

            {/* Right Side: Giant Egg Pin Location Graphic & Location Badge (Recreating Flyer Centerpiece) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              
              {/* Giant Egg Location Pin Visual */}
              <div className="relative w-64 h-80 sm:w-72 sm:h-96 flex flex-col items-center justify-center group cursor-pointer" onClick={onOpenTickets}>
                
                {/* Glow aura */}
                <div className="absolute inset-0 bg-amber-400/40 rounded-full blur-3xl group-hover:bg-orange-500/50 transition-all animate-pulse" />

                {/* SVG Egg Location Pin */}
                <div className="relative z-10 filter drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                  <svg width="240" height="310" viewBox="0 0 240 310" fill="none" xmlns="http://www.w3.org/2000/svg">
                    
                    {/* Pin Outer Shell (White Boiled Egg Shape) */}
                    <path 
                      d="M120 10 C 60 10, 20 60, 20 120 C 20 190, 105 285, 120 300 C 135 285, 220 190, 220 120 C 220 60, 180 10, 120 10 Z" 
                      fill="url(#eggWhiteGradient)" 
                      stroke="#FFFFFF" 
                      strokeWidth="6"
                    />

                    {/* Top Hole Effect for Location Pin */}
                    <ellipse cx="120" cy="70" rx="35" ry="25" fill="#38bdf8" opacity="0.3" />

                    {/* Yolk Inner Center */}
                    <ellipse cx="120" cy="180" rx="42" ry="48" fill="url(#yolkGradient)" />
                    
                    {/* Yolk Highlight */}
                    <ellipse cx="108" cy="165" rx="14" ry="8" fill="#FFFFFF" opacity="0.6" />

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="eggWhiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="70%" stopColor="#FFF8F0" />
                        <stop offset="100%" stopColor="#FFEAD2" />
                      </linearGradient>
                      <linearGradient id="yolkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FDBA74" />
                        <stop offset="40%" stopColor="#F97316" />
                        <stop offset="100%" stopColor="#EA580C" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Floating Peppers around egg pin */}
                <span className="absolute -top-2 -left-4 text-3xl animate-bounce">🌶️</span>
                <span className="absolute top-12 -right-6 text-4xl animate-pulse">🌶️</span>
              </div>

              {/* Location Badge (Recreating Flyer Orange Box) */}
              <div className="w-full max-w-sm mt-4 transform hover:scale-102 transition-transform">
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-3xl p-5 shadow-xl border-2 border-white/80 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-amber-200 text-xs font-black uppercase tracking-widest">
                    <Compass className="w-4 h-4" />
                    <span>VENUE LOCATION</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-wide font-display uppercase leading-tight">
                    CENCOR AVENUE
                  </h3>
                  <p className="text-sm sm:text-base font-extrabold text-amber-100 uppercase tracking-wider">
                    NORTH DZORWULU, ACCRA
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Footer Logo Badge (Recreating Flyer Bottom Right Logo "EKOW SAM FARMS") */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/30 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="bg-stone-900 text-white px-4 py-2 rounded-full flex items-center gap-3 border border-stone-700 shadow-md">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-stone-900 font-black text-xs">
                  🐔
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider block text-amber-400">ORGANIZED BY</span>
                  <span className="text-sm font-black tracking-tight text-white uppercase font-display">EKOW SAM FARMS</span>
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-stone-800 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-white">
              #KosuaNeMekoHangout2 • #EkowSamFarms • #AccraStreetFood
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
