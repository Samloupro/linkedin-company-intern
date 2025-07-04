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
  const cache = await caches.default;
  const keys = await cache.keys();
  for (const key of keys) {
    await cache.delete(key);
  }
  CACHE_VERSION++;
  console.log("Cache cleared. New cache version:", CACHE_VERSION);
  return CACHE_VERSION;
}
