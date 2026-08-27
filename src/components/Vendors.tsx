import React, { useState } from 'react';
import { Utensils, Search, Award } from 'lucide-react';
import { Vendor, VendorGroup } from '../types';
import { sanitizeImageUrl, formatCategoryLabel } from '../utils/sanitize';

interface VendorsProps {
  vendors: Vendor[];
  /** Admin-managed list, so new categories appear as filters automatically. */
  categories?: string[];
}

const GROUPS: { id: VendorGroup; heading: string; blurb: string }[] = [
  { id: 'food-drinks', heading: 'Food Vendors', blurb: 'Eat, sip and take home' },
  { id: 'other', heading: 'Other Stalls', blurb: 'Everything that is not food' },
];

export const Vendors: React.FC<VendorsProps> = ({ vendors, categories = [] }) => {
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
              id="input-vendor-search"
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
              // Only offer filters that actually match a stall.
              ...categories
                .filter((c) => vendors.some((v) => v.category === c))
                .map((c) => ({ id: c, label: formatCategoryLabel(c) })),
            ].map((cat) => (
              <button
                id={`btn-vendor-filter-${cat.id}`}
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

        {/*
          Two groups rather than one flat grid: not every stall sells food, and
          burying a non-food stall among the food ones misleads visitors. The
          split uses the explicit `group` field, not the category, so it stays
          correct when admins add categories.
        */}
        {GROUPS.map(({ id, heading, blurb }) => {
          const groupVendors = filteredVendors.filter((v) => v.group === id);
          if (groupVendors.length === 0) return null;
          return (
            <div key={id} className="mb-12 last:mb-0">
              <div className="flex items-baseline gap-3 mb-5 pb-3 border-b-2 border-stone-200">
                <h3 className="text-xl sm:text-2xl font-black font-display text-stone-900 uppercase tracking-tight">
                  {heading}
                </h3>
                <span className="text-xs font-bold text-stone-500">{blurb}</span>
                <span className="ml-auto text-xs font-black text-orange-600">{groupVendors.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image Banner */}
              <div className="relative h-48 overflow-hidden bg-stone-800">
                {sanitizeImageUrl(vendor.imageUrl) ? (
                  <img
                    src={sanitizeImageUrl(vendor.imageUrl)}
                    alt={vendor.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  /* No photo yet: a branded panel rather than a broken image icon. */
                  <div className="w-full h-full bg-gradient-to-br from-stone-800 via-stone-900 to-orange-950 flex items-center justify-center">
                    <span className="text-2xl font-black font-display text-orange-500/70 uppercase tracking-wide px-4 text-center">
                      {vendor.name}
                    </span>
                  </div>
                )}
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
          );
        })}

      </div>
    </section>
  );
};
