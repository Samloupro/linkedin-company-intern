export function formatCompanyResponse(scrapedData) {
  const {
    organization,
    finalUrl,
    foundedYear,
    specialties,
    industry,
    headquarters,
    fullAddress,
    address,
    employees,
    followers,
    publications,
    similarPages,
    companyLogo,
    companyCoverImage
  } = scrapedData;

  const result = {
    "company_info": {
      "company_identity": {
        "company_name": organization.name,
        "company_slogan": organization.slogan || "",
        "company_description": organization.description || "",
        "founded_year": foundedYear,
        "company_website": organization.sameAs || "",
        "company_linkedin_url": finalUrl,
        "company_logo_url": companyLogo,
        "company_cover_image_url": companyCoverImage
      },
      "company_classification": {
        "industry": industry,
        "specialties": specialties,
        "number_of_employees": employees,
        "followers": followers
      },
      "company_address": {
        "headquarters": headquarters,
        "full_address": fullAddress,
        "street_address": address.street_address || "",
        "address_locality": address.address_locality || "",
        "address_region": address.address_region || "",
        "postal_code": address.postal_code || "",
        "country": address.country || ""
      }
    },
    "recent_publications": publications,
    "similar_companies": similarPages
  };
  return result;
}
