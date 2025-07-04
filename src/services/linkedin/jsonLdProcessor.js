export function extractJsonLd(html) {
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if (!jsonLdMatch) {
    return { jsonLd: null, error: "JSON-LD script tag not found." };
  }
  try {
    const jsonLd = JSON.parse(jsonLdMatch[1]);
    return { jsonLd, error: null };
  } catch (e) {
    return { jsonLd: null, error: "Invalid JSON-LD format." };
  }
}

export function getOrganizationData(jsonLd) {
  if (!jsonLd || !jsonLd['@graph']) {
    return { organization: null, error: "Invalid JSON-LD structure: @graph is missing." };
  }
  const organization = jsonLd['@graph'].find(item => item && item['@type'] === 'Organization');
  if (!organization) {
    return { organization: null, error: "Company data not found in JSON-LD @graph." };
  }
  return { organization, error: null };
}
