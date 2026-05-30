import React, { useState } from 'react';
import { Menu, X, Database, Search, HelpCircle, LayoutGrid, Network, Cloud, RefreshCw, Zap, Cpu, Trash2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function MainLayout({
  children,
  history = [],
  activeTable,
  onSelectTable,
  onNewSession,
  onDownloadCsv,
  isHistoryLoading,
  fetchHistory,
  onDeleteHistoryItem
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculations for Top Header Stats
  const totalLeads = history.reduce((sum, item) => sum + (item.leads_count || 0), 0);
  const tablesCount = history.length;

  // Helper to format table names for the sidebar list
  const formatSidebarItem = (tableName) => {
    if (!tableName) return { title: 'Extraction Run', subtitle: '' };
    
    const parts = tableName.split('_');
    // Try to find the date section starting with YYYY
    let dateIndex = -1;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].length === 4 && /^\d{4}$/.test(parts[i])) {
        dateIndex = i;
        break;
      }
    }
    
    const queryParts = dateIndex !== -1 ? parts.slice(0, dateIndex) : parts;
    
    if (queryParts.length > 1) {
      const location = queryParts[queryParts.length - 1];
      const industry = queryParts.slice(0, queryParts.length - 1).join(' ');
      
      const title = `${industry.replace(/\b\w/g, c => c.toUpperCase())} in ${location.replace(/\b\w/g, c => c.toUpperCase())}`;
      return {
        title,
        subtitle: tableName
      };
    }
    
    const title = queryParts.join(' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
      title,
      subtitle: tableName
    };
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-r border-slate-900">
      {/* Brand Logo & Name */}
      <div className="flex items-center px-6 py-5 border-b border-slate-900 gap-3">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            LeadMiner
          </h1>
          <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block">
            B2B Data Extractor
          </span>
        </div>
      </div>

      {/* New Scraping Session outline button */}
      <div className="px-4 pt-6 pb-4">
        <button
          onClick={() => {
            onNewSession();
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full border border-slate-700 hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-300"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>New Scraping Session</span>
        </button>
      </div>

      {/* SCRAPING HISTORY list */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-6 py-3 flex items-center justify-between text-[10px] font-bold text-slate-500 tracking-wider uppercase">
          <span>Scraping History ({history.length})</span>
          {isHistoryLoading && <RefreshCw className="w-3 h-3 animate-spin text-cyan-500" />}
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {history.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-600">
              No runs recorded. Start a new search to populate history.
            </div>
          ) : (
            history.map((item) => {
              const formatted = formatSidebarItem(item.table_name);
              const isActive = activeTable === item.table_name;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectTable(item.table_name);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 block group relative overflow-hidden cursor-pointer ${
                    isActive
                      ? 'bg-purple-900/20 border-purple-500/30 text-white shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-slate-900 hover:text-slate-200 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-xs truncate max-w-[85%] group-hover:translate-x-0.5 transition-transform duration-200">
                    {formatted.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span className="truncate max-w-[120px] font-mono">{item.leads_count} leads</span>
                    <span className="truncate max-w-[80px] text-slate-600 group-hover:text-slate-500 text-[9px] transition-colors">{item.location || 'urban'}</span>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeleteHistoryItem) {
                        onDeleteHistoryItem(item.table_name);
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all focus:outline-none"
                    title="Delete History"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Active Indicator (hides when hovering to show delete button) */}
                  {isActive && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-slate-300 rounded-full group-hover:opacity-0 transition-opacity"></span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>v1.0.0 (Production)</span>
        </div>
        <button 
          onClick={() => fetchHistory && fetchHistory(false)}
          className="hover:text-cyan-400 transition-colors"
          title="Refresh History List"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Content Frame */}
      <div className="flex flex-col flex-1 md:pl-64 min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b border-slate-900/60 bg-slate-950/80 backdrop-blur-md">
          {/* Left Panel */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors focus:outline-none"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:block">
              {/* Empty placeholder to match layout */}
            </div>
          </div>

          {/* Middle Panel - Statistics Headers */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Total Leads:
              </span>
              <span className="text-xs font-black text-emerald-400 flex items-center gap-0.5 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                {totalLeads}
                <span className="text-[9px] text-emerald-400">↑</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Tables Created
              </span>
              <span className="text-xs font-black text-slate-200 px-2 py-0.5">
                {tablesCount}
              </span>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-900 mx-1"></div>
            
            {/* Supabase Connected status capsule */}
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 rounded-full px-3.5 py-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                <span className="hidden sm:inline text-emerald-400">Supabase connected</span>
                <span className="sm:hidden text-emerald-400">DB connected</span>
                <Cloud className="w-3 h-3 text-emerald-400" />
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar content drawer */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-950 border-r border-slate-900 transform transition-transform duration-300 ease-out animate-slide-right">
              <div className="absolute top-0 right-0 -mr-12 pt-4 pl-2">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="h-full flex flex-col">
                <SidebarContent />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto animate-slide-up max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
