/**
 * Formats an ISO date string into a beautiful readable format
 * e.g., "May 27, 2026, 11:30 AM"
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Extracts and cleans industry, location, and date information from dynamic table names.
 * e.g., "beauty_parlor_bangalore_2026_05_27_113000" -> "Beauty Parlor in Bangalore"
 */
export function parseTableName(tableName) {
  if (!tableName) return '';
  
  // Standard name pattern: industry_location_YYYY_MM_DD_HHMMSS
  // Let's split by underscore
  const parts = tableName.split('_');
  if (parts.length < 3) return tableName;
  
  // Try to find where the date starts (which begins with a 4-digit year like 202)
  let dateIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].length === 4 && /^\d{4}$/.test(parts[i])) {
      dateIndex = i;
      break;
    }
  }
  
  if (dateIndex === -1) {
    return tableName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  
  // Everything before the date index: split it in half, or guess industry vs location
  // If we can't easily guess, we can look at search history records.
  // But a simple fallback: join parts before date index
  const queryParts = parts.slice(0, dateIndex);
  
  // Let's assume the last part of queryParts is the location, and the rest is industry
  if (queryParts.length > 1) {
    const location = queryParts[queryParts.length - 1];
    const industry = queryParts.slice(0, queryParts.length - 1).join(' ');
    
    return {
      industry: industry.replace(/\b\w/g, c => c.toUpperCase()),
      location: location.replace(/\b\w/g, c => c.toUpperCase()),
      fullTitle: `${industry.replace(/\b\w/g, c => c.toUpperCase())} in ${location.replace(/\b\w/g, c => c.toUpperCase())}`
    };
  }
  
  const fullText = queryParts.join(' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    industry: fullText,
    location: '',
    fullTitle: fullText
  };
}

/**
 * Normalizes ratings to one decimal place, or returns "N/A"
 */
export function formatRating(rating) {
  if (rating === null || rating === undefined) return 'N/A';
  return Number(rating).toFixed(1);
}
