import React, { useState } from 'react';
import { Clock, MapPin, Calendar, Flame, Music, Gamepad2, Utensils } from 'lucide-react';
import { ScheduleItem } from '../types';
import { formatCategoryLabel } from '../utils/sanitize';

interface ScheduleProps {
  schedule: ScheduleItem[];
  dateString?: string;
  locationName?: string;
  /** Admin-managed list, so new categories appear as filters automatically. */
  categories?: string[];
}

export const Schedule: React.FC<ScheduleProps> = ({ schedule, dateString, locationName, categories = [] }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredItems = filter === 'all' 
    ? schedule 
    : schedule.filter((item) => item.category === filter);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'food':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase flex items-center gap-1"><Utensils className="w-3 h-3" /> Food & Tasting</span>;
      case 'competition':
        return <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase flex items-center gap-1"><Flame className="w-3 h-3 text-orange-600" /> Challenge</span>;
      case 'music':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase flex items-center gap-1"><Music className="w-3 h-3" /> Music & Party</span>;
      case 'community':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> Board Games</span>;
      default:
        // Admin-added categories have no bespoke icon or colour, but they must
        // still render — returning null here would leave the item unlabelled.
        return (
          <span className="bg-stone-100 text-stone-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
            {formatCategoryLabel(category)}
          </span>
        );
    }
  };

  return (
    <section id="schedule" className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>{dateString || 'EVENT DAY'} TIMELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-stone-900 tracking-tight uppercase">
            FLEXIBLE EVENT <span className="text-orange-600">LINE-UP</span>
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto">
            Timings are a guide, not a schedule — come when you can and stay as long as you like at {locationName || 'the venue'}.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'All Activities' },
              // Only offer filters that actually match something on the timeline.
              ...categories
                .filter((c) => schedule.some((item) => item.category === c))
                .map((c) => ({ id: c, label: formatCategoryLabel(c) })),
            ].map((tab) => (
              <button
                id={`btn-schedule-filter-${tab.id}`}
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  filter === tab.id
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule List */}
        <div className="relative border-l-2 border-orange-200 ml-4 sm:ml-32 space-y-8 pl-6 sm:pl-8 py-2">
          {filteredItems.map((item, idx) => (
            <div key={idx} className="relative group">
              
              {/* Timeline Bullet */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full bg-orange-600 border-4 border-white shadow-md group-hover:scale-125 transition-transform" />

              {/* Time display for desktop view */}
              <div className="hidden sm:block absolute -left-36 top-1 text-right w-28">
                <span className="font-extrabold text-sm text-orange-600 font-mono block">
                  {item.time}
                </span>
              </div>

              {/* Card Content */}
              <div className="bg-stone-50 hover:bg-orange-50/50 p-5 sm:p-6 rounded-2xl border border-stone-200 transition-all shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="sm:hidden font-mono font-extrabold text-xs text-orange-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.time}</span>
                  </div>
                  {getCategoryBadge(item.category)}
                  {item.location && (
                    <div className="text-xs font-bold text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold font-display text-stone-900">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
