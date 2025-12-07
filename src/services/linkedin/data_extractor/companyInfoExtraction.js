import { decodeHtmlEntities } from './htmlUtils.js';

export function extractCompanyGeneralInfo(html, jsonLd, organization, finalUrl) {
  // Initializing variables
  let foundedYear = null;
  let specialties = "";
  let industry = "";
  let headquarters = "";

  // Unified regex to find all dt/dd pairs
  // This loop replaces 4 separate full-text scans with 1
  const infoRegex = /<dt[^>]*>\s*(Founded|Specialties|Industry|Headquarters)\s*<\/dt>[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/gi;
  let match;
  while ((match = infoRegex.exec(html)) !== null) {
    const key = match[1].toLowerCase().trim();
    const val = decodeHtmlEntities(match[2].replace(/<[^>]+>/g, "").trim());

    switch (key) {
      case 'founded':
        foundedYear = parseInt(val, 10) || null;
        break;
      case 'specialties':
        specialties = val;
        break;
      case 'industry':
        industry = val;
        break;
      case 'headquarters':
        headquarters = val;
        break;
    }
  }

  // Extract company logo
  const companyLogo = organization.logo?.contentUrl ||
    html.match(/<meta property="og:image" content="([^"]*)"/i)?.[1] ||
    "";
  // Extract cover image
  const coverImageMatch = html.match(/(<img[^>]*class="cover-img__image[^>]*" src="([^"]*)"[^>]*>)/i);
  let companyCoverImage = coverImageMatch ? coverImageMatch[2] : ""; // Capture group 2 is the src attribute value

  // Decode HTML entities in the URL
  if (companyCoverImage) {
    companyCoverImage = decodeHtmlEntities(companyCoverImage);
  }

  return {
    company_name: organization.name,
    company_slogan: organization.slogan || "",
    company_website: organization.sameAs || "",
    company_linkedin_url: finalUrl,
    company_logo: companyLogo,
    company_cover_image: companyCoverImage,
    founded_year: foundedYear,
    specialties: specialties,
    industry: industry,
    headquarters: headquarters,
    company_description: organization.description || "",
  };
}
