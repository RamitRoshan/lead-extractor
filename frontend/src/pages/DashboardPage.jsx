import React, { useMemo } from 'react';
import { Database, Server, Star, Terminal, AlertTriangle, Cloud, Activity } from 'lucide-react';
import SearchForm from '../components/SearchForm';

export default function DashboardPage({
  history = [],
  onSearch,
  isSearching,
  consoleLogs = [],
  error = '',
  scrapedData = null,
  onSelectTable
}) {
  // Compute real metrics from history
  const totalLeads = useMemo(() => {
    return history.reduce((sum, item) => sum + (item.leads_count || 0), 0);
  }, [history]);

  const totalTables = history.length;

  return (
    <div className="space-y-6">
      
      {/* 1. Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Text details */}
        <div className="space-y-3 z-10 max-w-2xl">
          <h2 className="text-2xl md:text-3.5xl font-black tracking-tight text-white leading-tight">
            Search and Generate <br className="hidden sm:inline" />
            B2B Leads <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">Dynamically</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-xl">
            Input your target B2B industry and city. Our scraper generates verified business maps information and stores it directly into a dynamic schema in Supabase.
          </p>
        </div>

        {/* Engine State Side Card Widget */}
        <div className="z-10 shrink-0 self-start md:self-auto">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 min-w-[200px] shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-glow-brand">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                Engine State
              </span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                {isSearching ? (
                  <>
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Scraping</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cloud DB</span>
                  </>
                )}
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSearching ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isSearching ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Stat Card 1: Total Leads Scraped */}
        <div className="premium-glow-card p-6 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all duration-300">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
            Total Leads Scraped
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-800 dark:text-white">
              {totalLeads}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
              Verified
            </span>
          </div>
        </div>

        {/* Stat Card 2: Dynamic Tables */}
        <div className="premium-glow-card p-6 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all duration-300">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
            Dynamic Tables
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-800 dark:text-white">
              {totalTables}
            </span>
            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/5 px-1.5 py-0.5 rounded border border-cyan-500/10">
              Supabase
            </span>
          </div>
        </div>

        {/* Stat Card 3: Lead Quality Rating */}
        <div className="premium-glow-card p-6 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all duration-300">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
            Lead Quality Rating
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-black text-slate-800 dark:text-white">
              4.6
            </span>
            <span className="text-slate-400 text-xs">/ 5.0</span>
            <div className="flex items-center gap-0.5 ml-2">
              <Star className="w-4 h-4 fill-cyan-400 text-cyan-400" />
              <Star className="w-4 h-4 fill-cyan-400 text-cyan-400" />
              <Star className="w-4 h-4 fill-cyan-400 text-cyan-400" />
              <Star className="w-4 h-4 fill-cyan-400 text-cyan-400" />
              <Star className="w-4 h-4 fill-cyan-400/30 text-cyan-400/30" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Search inputs Form */}
      <SearchForm onSearch={onSearch} isSearching={isSearching} />

      {/* 4. Active Scraping Terminal / Log Viewer */}
      {(isSearching || consoleLogs.length > 0) && (
        <div className="rounded-2xl bg-black border border-slate-900 text-slate-300 font-mono text-xs overflow-hidden shadow-2xl animate-fade-in">
          <div className="bg-slate-950 px-5 py-4 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-cyan-400 shadow-glow-brand" />
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Scraper Live Terminal Node
              </span>
            </div>
            {isSearching && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
            )}
          </div>
          <div className="p-5 space-y-2.5 max-h-[300px] overflow-y-auto min-h-[140px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {consoleLogs.map((log, idx) => (
              <div key={idx} className={`leading-relaxed animate-fade-in break-words ${log.includes('❌') ? 'text-red-400' : log.includes('successfully') || log.includes('Complete') ? 'text-emerald-400' : 'text-slate-300'}`}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Scraping Error Alert */}
      {error && (
        <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm flex items-start gap-3.5 animate-fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <div>
            <h4 className="font-bold uppercase tracking-wider text-xs text-red-300">Scraping Node Fault</h4>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        </div>
      )}

    </div>
  );
}
