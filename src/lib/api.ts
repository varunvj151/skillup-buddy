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
 * Common fetch wrapper to handle errors consistently with a 60s timeout
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Create an AbortController for timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(id);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || errorData.message || `API Error: ${response.status} ${response.statusText}`;
      throw new Error(message);
    }
    
    return await response.json();
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.error(`[API] Timeout error for ${url}`);
      throw new Error("Request timed out after 60 seconds. Please try again.");
    }
    console.error(`[API] Fetch error for ${url}:`, error);
    throw error;
  }
}
