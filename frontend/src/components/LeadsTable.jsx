import React, { useState, useMemo } from 'react';
import { 
  Download, Search, Phone, MapPin, 
  Star, ChevronLeft, ChevronRight, SlidersHorizontal, Info 
} from 'lucide-react';
import { formatRating } from '../utils/formatters';

export default function LeadsTable({ 
  leads = [], 
  isLoading = false, 
  title = "Extracted Leads", 
  onDownloadCsv,
  tableName 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('phone-first'); // 'rating-high', 'rating-low', 'phone-first', 'none'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter leads by search term
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const term = searchTerm.toLowerCase();
      return (
        lead.business_name?.toLowerCase().includes(term) ||
        lead.category?.toLowerCase().includes(term) ||
        lead.address?.toLowerCase().includes(term) ||
        lead.phone_number?.includes(term)
      );
    });
  }, [leads, searchTerm]);

  // Sort leads
  const sortedLeads = useMemo(() => {
    const leadsCopy = [...filteredLeads];
    
    if (sortBy === 'rating-high') {
      return leadsCopy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortBy === 'rating-low') {
      return leadsCopy.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    }
    if (sortBy === 'phone-first') {
      // Prioritize leads with phone numbers (truthy phone number)
      return leadsCopy.sort((a, b) => {
        const aHasPhone = a.phone_number ? 1 : 0;
        const bHasPhone = b.phone_number ? 1 : 0;
        if (bHasPhone !== aHasPhone) return bHasPhone - aHasPhone;
        // Sub-sort by rating high-to-low
        return (b.rating || 0) - (a.rating || 0);
      });
    }
    return leadsCopy;
  }, [filteredLeads, sortBy]);

  // Paginated leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLeads, currentPage]);

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="premium-glow-card rounded-2xl overflow-hidden animate-slide-up">
      {/* Table Header Controls */}
      <div className="p-5 md:p-6 border-b border-slate-200/50 dark:border-slate-800/40 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              {filteredLeads.length} leads
            </span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Displaying only local businesses that have no website.
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, phone, address..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="phone-first">📞 Phone + Rating</option>
              <option value="rating-high">⭐️ Rating: High to Low</option>
              <option value="rating-low">⭐️ Rating: Low to High</option>
              <option value="none">🔄 Unsorted</option>
            </select>
          </div>

          {/* Export Button */}
          {onDownloadCsv && leads.length > 0 && (
            <button
              onClick={onDownloadCsv}
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border border-slate-800 dark:border-cyan-500/30 transition-colors active:scale-[0.98]"
              title="Download results as CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/55 dark:bg-slate-900/20 text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-widest uppercase border-b border-slate-200/40 dark:border-slate-800/40">
              <th className="py-4 px-6">Business Details</th>
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-6">Rating</th>
              <th className="py-4 px-6">Phone Number</th>
              <th className="py-4 px-6">Website Status</th>
              <th className="py-4 px-6">Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-sm">
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-5 px-6">
                    <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mt-2"></div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  </td>
                </tr>
              ))
            ) : paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
                    <Info className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <span className="font-semibold text-slate-500 dark:text-slate-400">No leads found</span>
                    <span className="text-xs text-slate-400">
                      {searchTerm ? "Try adjusting your search criteria" : "Run a new search or select a history item to load leads"}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors duration-150"
                >
                  {/* Business Details */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {lead.business_name}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {lead.city || 'Local Area'}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">
                    {lead.category || 'N/A'}
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-6">
                    {lead.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatRating(lead.rating)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 font-medium">N/A</span>
                    )}
                  </td>

                  {/* Phone Number */}
                  <td className="py-4 px-6">
                    {lead.phone_number ? (
                      <a 
                        href={`tel:${lead.phone_number}`}
                        className="inline-flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{lead.phone_number}</span>
                      </a>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[10px] rounded-lg bg-red-500/10 text-red-500/80 dark:bg-red-500/5 dark:text-red-400/80 border border-red-500/20 dark:border-red-500/10 font-bold uppercase tracking-wider">
                        No Phone
                      </span>
                    )}
                  </td>

                  {/* Website Status */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50">
                      ❌ No Website
                    </span>
                  </td>

                  {/* Address */}
                  <td className="py-4 px-6 max-w-xs truncate text-slate-500 dark:text-slate-400" title={lead.address}>
                    {lead.address ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{lead.address}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">N/A</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && !isLoading && (
        <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-700 dark:text-slate-300">{currentPage}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
