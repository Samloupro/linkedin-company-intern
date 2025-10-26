import { extractAddressDetails } from './addressExtraction.js';
import { extractCompanyGeneralInfo } from './companyInfoExtraction.js';
import { extractEmployeeAndFollowerData } from './employeeFollowerExtraction.js';
import { extractPublications } from './publicationExtraction.js';
import { extractSimilarCompanies } from './similarCompaniesExtraction.js';
import { extractFunding } from './fundingExtraction.js';

export function extractCompanyDetails(html, jsonLd, organization, finalUrl) {
  // Extract address details with robust error handling
  let addressDetails = {}; // Initialize to empty object
  try {
      addressDetails = extractAddressDetails(html, jsonLd, organization);
  } catch (error) {
      console.error("Error extracting address details:", error);
      // If an error occurs, addressDetails remains {} as initialized
  }

  // Extract general company information
  const companyGeneralInfo = extractCompanyGeneralInfo(html, jsonLd, organization, finalUrl);

  // Extract employee and follower data
  const employeeFollowerData = extractEmployeeAndFollowerData(html, organization);

  // Extract publications
  const publications = extractPublications(jsonLd);

  // Extract similar companies
  const similarPages = extractSimilarCompanies(html);

  // Extract funding information
  const fundingData = extractFunding(html);

  return {
    company_info: {
      company_identity: {
        company_name: companyGeneralInfo.company_name,
        company_slogan: companyGeneralInfo.company_slogan,
        company_description: companyGeneralInfo.company_description,
        founded_year: companyGeneralInfo.founded_year,
        company_website: companyGeneralInfo.company_website,
        company_linkedin_url: companyGeneralInfo.company_linkedin_url,
        company_logo: companyGeneralInfo.company_logo,
        company_cover_image: companyGeneralInfo.company_cover_image
      },
      company_classification: {
        industry: companyGeneralInfo.industry,
        specialties: companyGeneralInfo.specialties,
        number_of_employees: employeeFollowerData.employees,
        followers: employeeFollowerData.followers
      },
      company_address: {
        headquarters: companyGeneralInfo.headquarters,
        full_address: addressDetails.full_address || "",
        street_address: addressDetails.street_address || "",
        address_locality: addressDetails.address_locality || "",
        address_region: addressDetails.address_region || "",
        postal_code: addressDetails.postal_code || "",
        country: addressDetails.country || ""
      },
      funding: fundingData.Funding
    },
    recent_publications: publications,
    similar_companies: similarPages
  };
}
