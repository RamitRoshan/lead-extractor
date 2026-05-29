import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import LeadsTable from './components/LeadsTable';
import { apiService } from './services/api';

export default function App() {
  const [history, setHistory] = useState([]);
  const [activeTable, setActiveTable] = useState('');
  const [leads, setLeads] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [scrapedData, setScrapedData] = useState(null);

  // Helper to append log lines
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Fetch all historical scraping runs
  const fetchHistory = async (autoSelect = false) => {
    setIsHistoryLoading(true);
    setError('');
    try {
      const data = await apiService.getHistory();
      const loadedHistory = data || [];
      setHistory(loadedHistory);
      
      // Auto-select the first table if requested and available
      if (autoSelect && loadedHistory.length > 0 && !activeTable) {
        setActiveTable(loadedHistory[0].table_name);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch scraping history');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Load history on initial mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Fetch leads when active table selection changes
  useEffect(() => {
    if (!activeTable) {
      setLeads([]);
      return;
    }
    
    const fetchLeads = async () => {
      setIsLeadsLoading(true);
      try {
        const data = await apiService.getLeads(activeTable);
        setLeads(data || []);
      } catch (err) {
        console.error('Failed to load leads:', err);
      } finally {
        setIsLeadsLoading(false);
      }
    };

    fetchLeads();
  }, [activeTable]);

  // Handle new scrape search query
  const handleSearch = async (industry, location) => {
    setIsSearching(true);
    setScrapedData(null);
    setError('');
    setConsoleLogs([]);
    setActiveTable(''); // Clear selected table to show dashboard/progress
    
    addLog(`Initiating search query: "${industry} in ${location}"`);
    addLog("Connecting to browser automation service...");
    addLog("Launching Playwright browser engine...");
    addLog(`Navigating to target maps directory...`);
    
    // Set up timer logs to simulate live scraping activity
    const logIntervals = [
      setTimeout(() => addLog("Maps interface loaded. Scanning results feed container..."), 2000),
      setTimeout(() => addLog("Scrolling map results to load secondary listings..."), 4500),
      setTimeout(() => addLog("Analyzing web presence filters (filtering out businesses with websites)..."), 7000),
      setTimeout(() => addLog("Extracting details for promising leads (phone, rating, name, address)..."), 11000),
      setTimeout(() => addLog("Removing duplicate entries and normalizing phone structure..."), 15000),
      setTimeout(() => addLog("Connecting to database cluster to provision dynamic schemas..."), 18000),
      setTimeout(() => addLog("Schema verification complete. Inserting leads into table..."), 21000),
    ];

    try {
      const response = await apiService.searchLeads(industry, location);
      
      // Clear simulations
      logIntervals.forEach(clearTimeout);
      
      addLog("Scraping execution completed successfully!");
      addLog(`Created dynamic database table: ${response.table_name}`);
      addLog(`Discovered ${response.leads_count} qualified leads without websites.`);
      
      setScrapedData(response);
      
      // Reload history list so it appears in the sidebar instantly
      await fetchHistory();
      
      // Set active table to the new run to display the results!
      setActiveTable(response.table_name);
    } catch (err) {
      logIntervals.forEach(clearTimeout);
      setError(err.message || 'Scraper failed to run. Please check server log stream.');
      addLog(`❌ ERROR: Process aborted: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadCsv = (tableName) => {
    if (!tableName) return;
    const downloadUrl = apiService.getDownloadCsvUrl(tableName);
    window.open(downloadUrl, '_blank');
  };

  const handleSelectTable = (tableName) => {
    setScrapedData(null);
    setActiveTable(tableName);
  };

  const handleNewSession = () => {
    setActiveTable('');
    setScrapedData(null);
    setError('');
    // Note: we do NOT clear console logs so user can see last activity if they want,
    // but we can clear error states.
  };

  return (
    <MainLayout
      history={history}
      activeTable={activeTable}
      onSelectTable={handleSelectTable}
      onNewSession={handleNewSession}
      onDownloadCsv={handleDownloadCsv}
      isHistoryLoading={isHistoryLoading}
      fetchHistory={fetchHistory}
    >
      {activeTable ? (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <button
                onClick={handleNewSession}
                className="text-xl md:text-2xl font-bold text-slate-100 hover:text-purple-400 transition-colors flex items-center gap-2"
              >
                <span className="text-slate-500">←</span> {activeTable.split('_').slice(0, -4).join(' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="text-slate-400">Supabase Table:</span>
                <span className="text-purple-400 font-mono text-xs">{activeTable}</span>
              </div>
            </div>
            <button
              onClick={handleNewSession}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-purple-500/20 transition-colors active:scale-95 flex items-center gap-2"
            >
              + New Scrape
            </button>
          </div>
          <LeadsTable
            leads={leads}
            isLoading={isLeadsLoading}
            title={`Results: ${activeTable.split('_').slice(0, -4).join(' ').toUpperCase()}`}
            onDownloadCsv={() => handleDownloadCsv(activeTable)}
            tableName={activeTable}
          />
        </div>
      ) : (
        <DashboardPage
          history={history}
          onSearch={handleSearch}
          isSearching={isSearching}
          consoleLogs={consoleLogs}
          error={error}
          scrapedData={scrapedData}
          onSelectTable={handleSelectTable}
        />
      )}
    </MainLayout>
  );
}
