import retryFetch from '../utils/retryFetch.js';
import { proxyKey } from '../utils/proxyConfig.js'; // Import the new proxyKey
import { extractJsonLd, getOrganizationData } from './linkedin/jsonLdProcessor.js';
import { extractCompanyDetails } from './linkedin/data_extractor/index.js';

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

  // Extract all company details using the orchestrator
  const companyDetails = extractCompanyDetails(html, jsonLd, organization, finalUrl);

  return {
    organization, // Pass the organization object directly
    finalUrl, // Pass finalUrl directly
    companyLogo: companyDetails.company_info.company_identity.company_logo,
    foundedYear: companyDetails.company_info.company_identity.founded_year,
    specialties: companyDetails.company_info.company_classification.specialties,
    industry: companyDetails.company_info.company_classification.industry,
    headquarters: companyDetails.company_info.company_address.headquarters,
    fullAddress: companyDetails.company_info.company_address.full_address,
    address: companyDetails.company_info.company_address,
    employees: companyDetails.company_info.company_classification.number_of_employees,
    followers: companyDetails.company_info.company_classification.followers,
    publications: companyDetails.recent_publications,
    similarPages: companyDetails.similar_companies,
    companyCoverImage: companyDetails.company_info.company_identity.company_cover_image,
    funding: companyDetails.company_info.funding
  };
}
