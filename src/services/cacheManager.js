let CACHE_VERSION = 1;

export async function checkCache(url, requestHeaders) { 
  const cacheKey = new Request(url + "?v=" + CACHE_VERSION);
  const cachedResponse = await caches.default.match(cacheKey);
  return { cachedResponse, cacheKey };
}

export function storeCache(cacheKey, response, ctx) {
  ctx.waitUntil(caches.default.put(cacheKey, response.clone(), { expirationTtl: 2592000 }));
  console.log("Response cached for URL:", cacheKey.url);
}

export async function clearCache() {
  // Cloudflare Workers Cache API does not support cache.keys() or iterating over cache entries.
  // The current approach of incrementing CACHE_VERSION effectively invalidates old cache entries
  // by making them inaccessible with the new cache key.
  // Old entries will eventually expire based on their TTL.
  CACHE_VERSION++;
  console.log("Cache cleared. New cache version:", CACHE_VERSION);
  return CACHE_VERSION;
}
