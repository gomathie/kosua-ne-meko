import React from 'react';
import { Egg, Flame, Music, Gamepad2, Users, ShoppingBag } from 'lucide-react';
import chiliPepperSnSvg from '../assets/peppers/chili-pepper-sn.svg';

export const EventHighlights: React.FC = () => {
  const highlights = [
    {
      icon: <Egg className="w-8 h-8 text-amber-500" />,
      title: 'Fresh Ekow Sam Farm Eggs',
      description: 'Locally farmed organic poultry eggs, boiled fresh throughout the day with rich, creamy golden yolks.',
      bgColor: 'bg-amber-50 border-amber-200',
    },
    {
      icon: <img src={chiliPepperSnSvg} alt="Fresh Meko Pepper" className="w-8 h-8 object-contain" />,
      title: 'Artisanal Fresh Meko Salsa',
      description: 'Crushed live in traditional earthenware asanka bowls with scotch bonnet, onions, ginger, and secret spices.',
      bgColor: 'bg-orange-50 border-orange-200',
    },
    {
      icon: <Music className="w-8 h-8 text-emerald-600" />,
      title: 'Live Afrobeats & DJ Sets',
      description: 'Accra’s hottest DJs, brass band street processions, and sunset acoustic sessions at Dzorwulu.',
      bgColor: 'bg-emerald-50 border-emerald-200',
    },
    {
      icon: <Gamepad2 className="w-8 h-8 text-indigo-600" />,
      title: 'Ludo & Oware Tournaments',
      description: 'Compete in traditional board games with cash prizes, farm egg crates, and local bragging rights.',
      bgColor: 'bg-indigo-50 border-indigo-200',
    },
    {
      icon: <ShoppingBag className="w-8 h-8 text-rose-600" />,
      title: 'Street Food & Drinks Market',
      description: 'Kelewele, grilled tilapia, beef suya, waakye, cold palm wine, and iced sobolo fruit punch.',
      bgColor: 'bg-rose-50 border-rose-200',
    },
    {
      icon: <Users className="w-8 h-8 text-teal-600" />,
      title: 'Vibrant Community Vibe',
      description: 'Family-friendly atmosphere, cozy outdoor seating, photo booths, and networking for street food lovers.',
      bgColor: 'bg-teal-50 border-teal-200',
    },
  ];

  return (
    <section id="highlights" className="py-16 bg-stone-50 border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
            WHY YOU CAN'T MISS HANGOUT 2.0
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-stone-900 tracking-tight uppercase">
            ACCRA’S ULTIMATE <span className="text-orange-600">EGG & PEPPER</span> FESTIVAL
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Hangout 2.0 brings together foodies, families, gamers, and music lovers to celebrate the timeless street food combo of Kosua ne Meko.
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${item.bgColor}`}
            >
              <div className="p-3 rounded-2xl bg-white w-fit shadow-sm border border-stone-100 mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-extrabold font-display text-stone-900 mb-2">
                {item.title}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
