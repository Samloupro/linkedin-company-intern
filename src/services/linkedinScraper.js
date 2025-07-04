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
    company_info: { // New wrapper object
      company_identity: {
        company_name: organization.name,
        company_slogan: organization.slogan || "",
        company_website: organization.sameAs || "",
        company_linkedin_url: finalUrl,
        company_logo: companyDetails.company_logo,
        company_description: organization.description || "", // Moved here
        founded_year: companyDetails.founded_year, // Moved here
      },
      company_classification: { // New object
        industry: companyDetails.industry,
        specialties: companyDetails.specialties,
        number_of_employees: companyDetails.number_of_employees,
        followers: companyDetails.followers,
      },
      company_address: { // New object
        headquarters: companyDetails.headquarters,
        full_address: companyDetails.company_address.full_address,
        street_address: companyDetails.company_address.street_address || "",
        address_locality: companyDetails.company_address.address_locality || "",
        postal_code: companyDetails.company_address.postal_code || "",
        country: companyDetails.company_address.country || ""
      }
    },
    publications, // publications and similarPages remain at top level
    similarPages
  };
}
