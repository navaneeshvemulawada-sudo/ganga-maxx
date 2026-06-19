// Centralized API Base URL config.
// Supports both process.env and import.meta.env, with fallback to deployed production endpoint.
const API_URL = 
  (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) || 
  import.meta.env.VITE_API_URL || 
  import.meta.env.NEXT_PUBLIC_API_URL || 
  'https://ganga-maxx-api.onrender.com';

export default API_URL;
