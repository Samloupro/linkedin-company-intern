import { decodeHtmlEntities } from './htmlUtils.js';

export function extractCompanyGeneralInfo(html, jsonLd, organization, finalUrl) {
  // Extraction de l'année de fondation ("Founded Year") en tant que variable numérique
  const foundedYearMatch = html.match(/<dt[^>]*>\s*Founded\s*<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
  const foundedYearText = foundedYearMatch ? foundedYearMatch[1].replace(/<[^>]+>/g, "").trim() : null;
  const foundedYear = foundedYearText ? parseInt(foundedYearText, 10) : null;
  // Extraction des spécialités
  const specialtiesMatch = html.match(/<dt[^>]*>\s*Specialties\s*<\/dt>[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/);
  const specialties = specialtiesMatch ? decodeHtmlEntities(specialtiesMatch[1].replace(/<[^>]+>/g, "").trim()) : "";
  // Extraction de l'industrie
  const industryMatch = html.match(/<dt[^>]*>\s*Industry\s*<\/dt>[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/);
  const industry = industryMatch ? decodeHtmlEntities(industryMatch[1].replace(/<[^>]+>/g, "").trim()) : "";
  // Extraction du siège social (Headquarters)
  const headquartersMatch = html.match(/<dt[^>]*>\s*Headquarters\s*<\/dt>[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/);
  const headquarters = headquartersMatch ? decodeHtmlEntities(headquartersMatch[1].replace(/<[^>]+>/g, "").trim()) : "";

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
