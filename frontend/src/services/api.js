import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Triggers a new business lead extraction search
   * @param {string} industry 
   * @param {string} location 
   */
  async searchLeads(industry, location) {
    try {
      const response = await apiClient.post('/search', { industry, location });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  },

  /**
   * Retrieves all historical search/scraping executions
   */
  async getHistory() {
    try {
      const response = await apiClient.get('/history');
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  },

  /**
   * Deletes a specific historical search execution and its table
   * @param {string} tableName 
   */
  async deleteHistory(tableName) {
    try {
      const response = await apiClient.delete(`/history/${tableName}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  },

  /**
   * Fetches lead records stored under a specific dynamic table name
   * @param {string} tableName 
   */
  async getLeads(tableName) {
    try {
      const response = await apiClient.get(`/leads/${tableName}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  },

  /**
   * Get the absolute URL to download CSV of leads
   * @param {string} tableName 
   * @returns {string}
   */
  getDownloadCsvUrl(tableName) {
    return `${API_BASE_URL}/leads/${tableName}/csv`;
  },

  /**
   * Local error handler
   */
  _handleError(error) {
    console.error('API service call failed:', error);
    const message = error.response?.data?.detail || error.message || 'An unknown network error occurred';
    throw new Error(message);
  }
};
