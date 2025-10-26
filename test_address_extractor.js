import { extractCompanyDetails, extractPublications, extractSimilarCompanies } from './src/services/linkedin/dataExtractors.js';
import { extractJsonLd, getOrganizationData } from './src/services/linkedin/jsonLdProcessor.js';
import fs from 'fs';

// Read the HTML content from the local file
const html = fs.readFileSync('LinkedIn Page/google_all_sections.html', 'utf-8');

// The final URL is not relevant for this local test, can be a placeholder
const finalUrl = 'https://www.linkedin.com/company/google/';

// 1. Extract JSON-LD data from the HTML
const { jsonLd, error: jsonLdError } = extractJsonLd(html);
if (jsonLdError) {
  console.error("Error extracting JSON-LD:", jsonLdError);
  process.exit(1);
}

// 2. Extract Organization data from JSON-LD
const { organization, error: orgDataError } = getOrganizationData(jsonLd);
if (orgDataError) {
  console.error("Error getting organization data:", orgDataError);
  process.exit(1);
}

// 3. Extract company details using the core function
const companyDetails = extractCompanyDetails(html, jsonLd, organization, finalUrl);

// 4. Log the extracted company address details to verify the changes
console.log('Extracted Company Address Details:');
console.log(JSON.stringify(companyDetails.company_address, null, 2));
