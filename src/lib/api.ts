/**
 * API client configuration
 */

// Centralized API BASE URL logic
// Defaults to empty string in development so vite proxy works if configured correctly,
// but allows overriding via environment variables for production deployments.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Debugging logs for production API connection
if (import.meta.env.PROD) {
  console.log(`[API] Production Backend URL: ${API_BASE_URL || 'Same-origin (proxy suggested)'}`);
}

/**
 * Common fetch wrapper to handle errors consistently
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Attempt to parse error details
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || errorData.message || `API Error: ${response.status} ${response.statusText}`;
      throw new Error(message);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[API] Fetch error for ${url}:`, error);
    throw error;
  }
}
