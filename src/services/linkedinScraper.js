import retryFetch from '../utils/retryFetch.js';
import { proxyKey } from '../utils/proxyConfig.js'; // Import the new proxyKey
import { extractJsonLd, getOrganizationData } from './linkedin/jsonLdProcessor.js';
import { extractCompanyDetails, extractPublications, extractSimilarCompanies } from './linkedin/dataExtractors.js';

export async function scrapeCompanyData(url, requestHeaders, env) {
  // Using hardcoded residential proxy for testing
  console.log("Using residential proxy:", proxyKey);

  const response = await retryFetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Cloudflare-Worker/1.0)',
      "X-Proxy": proxyKey // Use the hardcoded proxyKey directly
    },
    timeout: 5000
  });
  const finalUrl = response.url;
  const html = await response.text();

  // Extract JSON-LD data
  const { jsonLd, error: jsonLdError } = extractJsonLd(html);
  if (jsonLdError) {
    return { error: jsonLdError };
  }

  // Extract Organization data from JSON-LD
  const { organization, error: orgDataError } = getOrganizationData(jsonLd);
  if (orgDataError) {
    return { error: orgDataError };
  }
  console.log("Organization data:", organization);

  // Extract other company details
  const companyDetails = extractCompanyDetails(html, jsonLd, organization, finalUrl);
  const publications = extractPublications(jsonLd);
  const similarPages = extractSimilarCompanies(html);

  return {
    organization, // Pass the organization object directly
    finalUrl, // Pass finalUrl directly
    companyLogo: companyDetails.company_logo,
    foundedYear: companyDetails.founded_year,
    specialties: companyDetails.specialties,
    industry: companyDetails.industry,
    headquarters: companyDetails.headquarters,
    fullAddress: companyDetails.company_address.full_address,
    address: companyDetails.company_address, // Pass full address object
    employees: companyDetails.number_of_employees,
    followers: companyDetails.followers,
    publications,
    similarPages
  };
}
