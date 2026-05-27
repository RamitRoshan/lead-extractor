import React, { useState } from 'react';
import { Search, MapPin, Loader2, Zap } from 'lucide-react';

export default function SearchForm({ onSearch, isSearching }) {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');

  const presets = [
    { industry: 'Gym', location: 'Delhi' },
    { industry: 'Coaching', location: 'Bangalore' },
    { industry: 'Restaurant', location: 'Mumbai' },
    { industry: 'Salon', location: 'Bangalore' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!industry.trim() || !location.trim()) return;
    onSearch(industry.trim(), location.trim());
  };

  const handleApplyPreset = (p) => {
    if (isSearching) return;
    setIndustry(p.industry);
    setLocation(p.location);
    onSearch(p.industry, p.location);
  };

  return (
    <div className="premium-glow-card rounded-2xl p-6 md:p-8 animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Industry input */}
          <div className="space-y-2.5">
            <label 
              htmlFor="industry-input"
              className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block"
            >
              1. Industry or Business Category
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                id="industry-input"
                type="text"
                placeholder="e.g. gym, coaching centre, restaurant, salon..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isSearching}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/80 transition-all duration-200 disabled:opacity-60 text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* Location input */}
          <div className="space-y-2.5">
            <label 
              htmlFor="location-input"
              className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block"
            >
              2. Target Location / City
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                id="location-input"
                type="text"
                placeholder="e.g. delhi, bangalore, mumbai, pune..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSearching}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/80 transition-all duration-200 disabled:opacity-60 text-sm font-medium"
                required
              />
            </div>
          </div>
        </div>

        {/* Action Button & Suggestions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pt-2 gap-4">
          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              Quick suggestions:
            </span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                disabled={isSearching}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/60 transition-all duration-150 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {preset.industry} in {preset.location}
              </button>
            ))}
          </div>

          {/* Submit Scraper Button */}
          <button
            type="submit"
            disabled={isSearching || !industry.trim() || !location.trim()}
            className="px-7 py-3 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-900 dark:disabled:to-slate-900 text-white font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 border border-cyan-500/20 shadow-lg shadow-cyan-500/10 active:scale-[0.98] transition-all duration-200 disabled:pointer-events-none disabled:shadow-none hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0"
            id="start-search-btn"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Scrape Leads</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
