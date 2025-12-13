/**
 * API Configuration
 * Centralized API base URL configuration
 */

// Use Vite environment variable or fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_API_TARGET || 'http://localhost:5000'
