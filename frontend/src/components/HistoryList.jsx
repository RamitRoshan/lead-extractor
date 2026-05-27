import React from 'react';
import { Calendar, ArrowRight, Database, FileSpreadsheet, Layers } from 'lucide-react';
import { formatDate, parseTableName } from '../utils/formatters';

export default function HistoryList({ history = [], onSelectTable, onDownloadCsv, activeTable }) {
  if (history.length === 0) {
    return (
      <div className="premium-glow-card rounded-2xl p-8 text-center">
        <Layers className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No scraping history found</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Perform a search on the Scraper tab to extract your first leads!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 animate-slide-up">
      {history.map((item) => {
        const parsed = parseTableName(item.table_name);
        const displayTitle = typeof parsed === 'object' ? parsed.fullTitle : parsed;
        const isActive = activeTable === item.table_name;

        return (
          <div
            key={item.id}
            className={`p-4 md:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/10 to-teal-500/5 border-cyan-500/30 dark:border-cyan-500/40 shadow-sm shadow-cyan-500/5'
                : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-800 shadow-sm'
            }`}
          >
            {/* Run Metadata */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-500 shrink-0" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  {displayTitle}
                </h4>
              </div>
              
              <div className="flex flex-wrap items-center text-xs text-slate-400 dark:text-slate-500 gap-x-3 gap-y-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div>
                  <span className="font-semibold text-cyan-500 dark:text-cyan-400">{item.leads_count}</span> Leads Without Website
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => onDownloadCsv(item.table_name)}
                type="button"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800/40 hover:text-slate-800 transition-colors"
                title="Download CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onSelectTable(item.table_name)}
                type="button"
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 flex items-center gap-1.5 active:scale-[0.98] ${
                  isActive
                    ? 'bg-cyan-500 border-cyan-500 text-white shadow-sm hover:bg-cyan-600'
                    : 'bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>View Leads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
