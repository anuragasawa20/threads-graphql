/**
 * GraphQL Client - Multi-method for testing
 *
 * WHY "Failed to construct 'URL': Invalid URL" HAPPENED WITH FETCH:
 * - fetch() internally uses the URL API (new URL()) to parse the request URL
 * - In some environments (Cursor embedded browser, Electron, opaque origins),
 *   the base URL for resolving relative URLs can be invalid
 * - Relative URLs like "/graphql" need a base; if base is "null" or invalid, it throws
 * - Even absolute URLs can fail if the environment restricts URL construction
 *
 * WHY XMLHttpRequest WORKED:
 * - XHR uses older, different URL handling (pre-URL API)
 * - It resolves URLs relative to the document without the same strict parsing
 * - Bypasses the problematic new URL() code path entirely
 *
 * METHODS FOR TESTING:
 * - xhr: XMLHttpRequest (most compatible, works in restricted environments)
 * - fetch: Native fetch with absolute URL (standard, may fail in some contexts)
 * - fetch-proxy: fetch with relative /graphql (uses Vite proxy, same-origin)
 */

const METHOD = import.meta.env.VITE_GRAPHQL_METHOD || 'xhr';

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_URL?.startsWith('http')
    ? import.meta.env.VITE_GRAPHQL_URL
    : 'http://localhost:4000/graphql';

const PROXY_ENDPOINT = '/graphql'; // Vite proxies this to backend

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function graphqlViaFetch(url, query, variables) {
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error');
  return json.data;
}

function graphqlViaXHR(url, query, variables) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    const headers = getAuthHeaders();
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (json.errors) reject(new Error(json.errors[0]?.message || 'GraphQL error'));
        else resolve(json.data);
      } catch (e) {
        reject(new Error(xhr.responseText || 'Request failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(JSON.stringify({ query, variables }));
  });
}

export function graphqlRequest(query, variables = {}) {
  if (METHOD === 'fetch') {
    return graphqlViaFetch(GRAPHQL_ENDPOINT, query, variables);
  }
  if (METHOD === 'fetch-proxy') {
    return graphqlViaFetch(PROXY_ENDPOINT, query, variables);
  }
  return graphqlViaXHR(GRAPHQL_ENDPOINT, query, variables);
}
