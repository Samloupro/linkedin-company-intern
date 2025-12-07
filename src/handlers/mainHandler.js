
import { processRequest } from '../services/requestProcessor.js';
import { checkCache, storeCache, clearCache } from '../services/cacheManager.js';
import { scrapeCompanyData } from '../services/linkedinScraper.js';
import { formatCompanyResponse } from '../services/responseFormatter.js'; // New import

export default {
  async fetch(request, env, ctx) {



    const urlObj = new URL(request.url);
    if (urlObj.pathname === "/clear-cache") {
      const newVersion = await clearCache();
      return new Response(JSON.stringify({ message: "Cache cleared", newVersion }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Process request and extract URL and cache flag
    const { url, useCache, error: requestError } = await processRequest(request);
    if (requestError) {
      return requestError;
    }

    let cachedResponse = null;
    let cacheKey = null;

    if (useCache) { // If useCache is true, we check the cache
      const cacheResult = await checkCache(url, request.headers);
      cachedResponse = cacheResult.cachedResponse;
      cacheKey = cacheResult.cacheKey;

      if (cachedResponse) {
        return cachedResponse; // Return cached response if it exists
      }
    }

    try {
      // Scrape company data
      const { error: scrapeError, ...scrapedData } = await scrapeCompanyData(url, request.headers, env);
      if (scrapeError) {
        return scrapeError;
      }

      // Format the scraped data into the final response structure
      const finalResult = formatCompanyResponse(scrapedData);

      const finalResponse = new Response(JSON.stringify([finalResult], null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

      // Store response in cache, only if useCache is true
      if (useCache) {
        storeCache(cacheKey, finalResponse.clone(), ctx); // Pass ctx here
      }

      return finalResponse;
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
