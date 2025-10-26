export async function processRequest(request) {
  let url;
  let useCache = true; // Default to true: use cache

  if (request.method === "POST") {
    const body = await request.json();
    url = body.url;
    // Prepend https:// if no protocol is present
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Normalize LinkedIn company URLs
    const linkedinCompanyMatch = url.match(/^(https?:\/\/(?:www\.)?linkedin\.com\/company\/[^\/]+)\/?/);
    if (linkedinCompanyMatch && linkedinCompanyMatch[1]) {
      url = linkedinCompanyMatch[1] + '/'; // Ensure trailing slash for consistency
    }
    // If 'cache' is explicitly false in the body, then disable cache
    if (body.cache === false) {
      useCache = false;
    }
  } else {
    return {
      error: new Response(JSON.stringify({ error: "Only POST requests are allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      })
    };
  }

  if (!url) {
    return {
      error: new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    };
  }

  url = encodeURI(url);
  console.log(`Processing request for URL: ${url}, Cache enabled: ${useCache}`);
  return { url, useCache }; // Return URL and useCache flag
}
