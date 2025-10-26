import { extractAddressDetails } from './addressExtraction.js';
import { extractCompanyGeneralInfo } from './companyInfoExtraction.js';
import { extractEmployeeAndFollowerData } from './employeeFollowerExtraction.js';
import { extractPublications } from './publicationExtraction.js';
import { extractSimilarCompanies } from './similarCompaniesExtraction.js';

export function extractCompanyDetails(html, jsonLd, organization, finalUrl) {
  // Extract address details
  const addressDetails = extractAddressDetails(html, jsonLd, organization);

  // Extract general company information
  const companyGeneralInfo = extractCompanyGeneralInfo(html, jsonLd, organization, finalUrl);

  // Extract employee and follower data
  const employeeFollowerData = extractEmployeeAndFollowerData(html, organization);

  // Extract publications
  const publications = extractPublications(jsonLd);

  // Extract similar companies
  const similarPages = extractSimilarCompanies(html);

  return {
    company_name: companyGeneralInfo.company_name,
    company_slogan: companyGeneralInfo.company_slogan,
    company_website: companyGeneralInfo.company_website,
    company_linkedin_url: companyGeneralInfo.company_linkedin_url,
    company_logo: companyGeneralInfo.company_logo,
    company_cover_image: companyGeneralInfo.company_cover_image,
    founded_year: companyGeneralInfo.founded_year,
    specialties: companyGeneralInfo.specialties,
    industry: companyGeneralInfo.industry,
    headquarters: companyGeneralInfo.headquarters,
    company_address: addressDetails,
    company_description: companyGeneralInfo.company_description,
    number_of_employees: employeeFollowerData.employees,
    followers: employeeFollowerData.followers,
    publications: publications,
    similarPages: similarPages
  };
}
