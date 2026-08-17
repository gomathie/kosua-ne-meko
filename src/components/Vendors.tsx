import React, { useState } from 'react';
import { Utensils, Search, Award } from 'lucide-react';
import { Vendor } from '../types';
import { sanitizeImageUrl } from '../utils/sanitize';

interface VendorsProps {
  vendors: Vendor[];
}

export const Vendors: React.FC<VendorsProps> = ({ vendors }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredVendors = vendors.filter((v) => {
    const matchesCat = activeCategory === 'all' || v.category === activeCategory;
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="vendors" className="py-16 bg-stone-100 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider border border-amber-200">
            <Utensils className="w-4 h-4 text-amber-700" />
            <span>FOOD, DRINKS & FARM STALLS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-stone-900 tracking-tight uppercase">
            FEAST AT THE <span className="text-orange-600">STREET MARKET</span>
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Taste organic farm-fresh eggs, freshly pounded meko pepper, local street food delights, and ice-cold palm wine.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search dishes or stalls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Stalls' },
              { id: 'eggs-pepper', label: 'Eggs & Pepper' },
              { id: 'street-food', label: 'Street Eats' },
              { id: 'drinks', label: 'Palm Wine & Sobolo' },
              { id: 'farm-fresh', label: 'Farm Take-Home' },
              { id: 'entertainment', label: 'Pebble Cinema' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image Banner */}
              <div className="relative h-48 overflow-hidden bg-stone-800">
                <img
                  src={sanitizeImageUrl(vendor.imageUrl)}
                  alt={vendor.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
                
                {vendor.badge && (
                  <span className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>{vendor.badge}</span>
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-black font-display text-stone-900 group-hover:text-orange-600 transition-colors">
                    {vendor.name}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                    {vendor.description}
                  </p>
                </div>

                <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] font-black uppercase text-amber-800 block tracking-wider">
                    MUST-TRY SPECIALTY
                  </span>
                  <span className="text-xs font-bold text-stone-900">
                    {vendor.specialty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
