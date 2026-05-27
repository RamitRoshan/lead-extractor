import React, { useState } from 'react';
import SearchForm from '../components/SearchForm';
import LeadsTable from '../components/LeadsTable';
import { apiService } from '../services/api';
import { Sparkles, Terminal, AlertCircle, FileCheck } from 'lucide-react';

export default function LeadsPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [error, setError] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);

  // Local helper to add logs to the mock console
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleSearch = async (industry, location) => {
    setIsSearching(true);
    setScrapedData(null);
    setError('');
    setConsoleLogs([]);
    
    addLog(`Initiating search query: "${industry} in ${location}"`);
    addLog("Connecting to browser automation service...");
    addLog("Launching Playwright (Headless Mode)...");
    addLog(`Navigating to Google Maps search page...`);
    
    // Set up timer logs to simulate scraper logs feedback
    const logIntervals = [
      setTimeout(() => addLog("Google Maps page loaded. Scanning results container..."), 2500),
      setTimeout(() => addLog("Scrolling business sidebar feed to load listings..."), 5000),
      setTimeout(() => addLog("Applying filter: checking and skipping businesses with existing websites..."), 8000),
      setTimeout(() => addLog("Clicking on prospective offline businesses to parse contact cards..."), 12000),
      setTimeout(() => addLog("Normalizing phone number formats & cleaning duplicate leads..."), 17000),
      setTimeout(() => addLog("Connecting to Supabase Database to create dynamic tables..."), 22000),
      setTimeout(() => addLog("Dynamic SQL table created. Inserting leads..."), 25000),
    ];

    try {
      const response = await apiService.searchLeads(industry, location);
      
      // Clear logs timer
      logIntervals.forEach(clearTimeout);
      
      addLog("Scraping operation finished successfully!");
      addLog(`Created dynamic table: ${response.table_name}`);
      addLog(`Extracted ${response.leads_count} qualified leads without websites!`);
      
      setScrapedData(response);
    } catch (err) {
      logIntervals.forEach(clearTimeout);
      setError(err.message || 'Scraping operation failed. Check server logs.');
      addLog(`❌ ERROR: Scraper terminated unexpectedly: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!scrapedData?.table_name) return;
    const downloadUrl = apiService.getDownloadCsvUrl(scrapedData.table_name);
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          B2B Lead Scraper
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Scrape and identify local businesses that do not have websites to prioritize cold outreach.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left column (Form & Logs Console) */}
        <div className="xl:col-span-1 space-y-6">
          <SearchForm onSearch={handleSearch} isSearching={isSearching} />
          
          {/* Active Scraping Terminal / Log Viewer */}
          {(isSearching || consoleLogs.length > 0) && (
            <div className="rounded-2xl bg-slate-950 border border-slate-900 text-slate-300 font-mono text-xs overflow-hidden shadow-2xl">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand-500" />
                  <span className="font-semibold text-slate-400">Scraper Log Console</span>
                </div>
                {isSearching && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto min-h-[120px]">
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed animate-fade-in break-words">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Scraping Error</h4>
                <p className="text-xs text-red-500/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {scrapedData && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3">
              <FileCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Extraction Complete</h4>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                  Successfully stored {scrapedData.leads_count} offline leads in table: <code className="bg-emerald-500/10 px-1 py-0.5 rounded font-mono text-[10px]">{scrapedData.table_name}</code>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column (Newly Scraped Leads Table) */}
        <div className="xl:col-span-2">
          {isSearching ? (
            <LeadsTable leads={[]} isLoading={true} title="Extracting leads..." />
          ) : scrapedData ? (
            <LeadsTable
              leads={scrapedData.leads}
              isLoading={false}
              title={`Results: ${scrapedData.leads.length} Leads Found`}
              onDownloadCsv={handleDownloadCsv}
              tableName={scrapedData.table_name}
            />
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center min-h-[400px]">
              <Sparkles className="w-10 h-10 text-brand-500/40 mb-4 animate-pulse-subtle" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Ready to Scrape</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">
                Enter an industry and location in the search panel on the left, then click "Find Offline Leads" to run Playwright.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
