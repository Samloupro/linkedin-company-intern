export async function checkCache(url, requestHeaders) { // requestHeaders is no longer needed for cacheKey, but kept for function signature consistency
  const cacheKey = new Request(url);
  const cachedResponse = await caches.default.match(cacheKey);
  return { cachedResponse, cacheKey };
}

export function storeCache(cacheKey, response, ctx) {
  ctx.waitUntil(caches.default.put(cacheKey, response.clone(), { expirationTtl: 2592000 }));
  console.log("Response cached for URL:", cacheKey.url);
}

export async function clearAllCache() {
  const cache = await caches.default;
  const keys = await cache.keys();
  for (const key of keys) {
    await cache.delete(key);
  }
  console.log("All cache entries cleared.");
}
