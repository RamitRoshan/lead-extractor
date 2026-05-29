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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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
      <div className="p-5 md:p-6 border-b border-slate-800/40 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search bar */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads by name, address, category, website..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-3">
          {/* Show Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Show:</span>
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="pl-3 pr-8 py-2 rounded-xl border border-slate-800 bg-slate-900/40 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 appearance-none cursor-pointer"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          {onDownloadCsv && leads.length > 0 && (
            <button
              onClick={onDownloadCsv}
              type="button"
              className="px-4 py-2 rounded-xl bg-transparent hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors active:scale-[0.98]"
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
            <tr className="bg-slate-900/20 text-slate-300 text-xs font-bold tracking-wide border-b border-slate-800/40">
              <th className="py-4 px-6">Business Name</th>
              <th className="py-4 px-6">Rating</th>
              <th className="py-4 px-6">Phone Number</th>
              <th className="py-4 px-6">Address</th>
              <th className="py-4 px-6">Website</th>
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-6">City</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-sm">
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
                  className="hover:bg-slate-900/30 transition-colors duration-150"
                >
                  {/* Business Name */}
                  <td className="py-4 px-6 font-bold text-slate-100">
                    {lead.business_name}
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-6">
                    {lead.rating ? (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-200">
                          {formatRating(lead.rating)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-600 font-medium">N/A</span>
                    )}
                  </td>

                  {/* Phone Number */}
                  <td className="py-4 px-6">
                    {lead.phone_number ? (
                      <div className="text-slate-300">
                        {lead.phone_number.split(';').map((phone, i) => (
                          <div key={i} className="flex items-center gap-1.5 mt-0.5 first:mt-0">
                            <span className="text-slate-500 text-xs">📞</span>
                            <span>{phone.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-600 font-medium">N/A</span>
                    )}
                  </td>

                  {/* Address */}
                  <td className="py-4 px-6 max-w-xs text-slate-400" title={lead.address}>
                    {lead.address ? (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <span>{lead.address}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 font-medium">N/A</span>
                    )}
                  </td>

                  {/* Website Status */}
                  <td className="py-4 px-6 text-slate-400">
                    N/A
                  </td>

                  {/* Category */}
                  <td className="py-4 px-6">
                    {lead.category ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 bg-slate-800 rounded-lg uppercase border border-slate-700">
                        {lead.category}
                      </span>
                    ) : (
                      <span className="text-slate-600 font-medium">N/A</span>
                    )}
                  </td>

                  {/* City */}
                  <td className="py-4 px-6 text-slate-400">
                    {lead.city || 'N/A'}
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
