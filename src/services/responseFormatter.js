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
    similarPages
  } = scrapedData;

  const result = {
    "company_info": {
      "company_identity": {
        "company_name": organization.name,
        "company_slogan": organization.slogan || "",
        "company_description": organization.description || "",
        "founded_year": foundedYear,
        "company_website": organization.sameAs || "",
        "company_linkedin_url": finalUrl
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
        "street_address": address.streetAddress || "",
        "address_locality": address.addressLocality || "",
        "postal_code": address.postalCode || "",
        "country": address.addressCountry || ""
      }
    },
    "recent_publications": publications,
    "similar_companies": similarPages
  };
  return result;
}
