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

export function clearCache() {
  CACHE_VERSION++;
  console.log("Cache cleared. New cache version:", CACHE_VERSION);
  return CACHE_VERSION;
}
