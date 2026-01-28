/**
 * CORS proxy configuration
 * These proxies help bypass CORS restrictions for public APIs
 */

// Available CORS proxies (fallback chain)
const CORS_PROXIES = [
  // corsproxy.io - reliable and fast
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // allorigins - another option
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
]

let currentProxyIndex = 0

/**
 * Fetch with CORS proxy support
 * Automatically uses a proxy to bypass CORS restrictions
 */
export async function fetchWithProxy(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // First try direct fetch (in case CORS is allowed)
  try {
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
    })
    if (response.ok) {
      return response
    }
  } catch {
    // CORS error, continue to proxy
  }

  // Try proxies
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxyIndex = (currentProxyIndex + i) % CORS_PROXIES.length
    const proxyUrl = CORS_PROXIES[proxyIndex](url)

    try {
      const response = await fetch(proxyUrl, {
        ...options,
        // Remove mode for proxy requests
        mode: undefined,
      })

      if (response.ok) {
        // Remember this proxy worked
        currentProxyIndex = proxyIndex
        return response
      }
    } catch (error) {
      console.warn(`Proxy ${proxyIndex} failed:`, error)
      continue
    }
  }

  throw new Error(`Failed to fetch ${url} - all proxies failed`)
}

/**
 * Fetch JSON with CORS proxy support
 */
export async function fetchJsonWithProxy<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetchWithProxy(url, options)
  return response.json()
}

/**
 * POST JSON with CORS proxy support
 */
export async function postJsonWithProxy<T>(
  url: string,
  body: unknown
): Promise<T> {
  const response = await fetchWithProxy(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return response.json()
}
