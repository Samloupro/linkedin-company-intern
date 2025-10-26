export function extractCompanyDetails(html, jsonLd, organization, finalUrl) {
  // Adresse formatée
  let streetAddress = organization.address?.streetAddress || "";
  let addressLocality = organization.address?.addressLocality || "";
  let addressRegion = organization.address?.addressRegion || ""; // Added addressRegion initialization
  let postalCode = organization.address?.postalCode || "";
  let country = organization.address?.addressCountry || "";

  // Fallback to HTML parsing if JSON-LD address components are missing
  if (!streetAddress || !addressLocality || !addressRegion || !postalCode || !country) { // Added addressRegion to condition
            console.log("HTML parsing fallback for address initiated.");
      const addressDivMatch = html.match(/<div[^>]*id="address-0"[^>]*>([\s\S]*?)<\/div>/i);
      if (addressDivMatch && addressDivMatch[1]) {
          const pTags = addressDivMatch[1].match(/<p>([\s\S]*?)<\/p>/gi);
          if (pTags && pTags.length >= 2) {
              // First p tag usually contains street address
              streetAddress = streetAddress || pTags[0].replace(/<[^>]+>/g, "").trim();
                            console.log(`Street address from HTML: ${streetAddress}`);

              // Second p tag usually contains city, state, postal code, country
              const secondPTextContent = pTags[1].replace(/<[^>]+>/g, "").trim(); // Renamed to avoid redeclaration
              const secondPTextParts = secondPTextContent.split(',').map(part => part.trim()).filter(part => part !== '');

              // Attempt to find country, postal code, region, and locality from the parts
              // Prioritize from right to left where patterns are often more distinct

              if (secondPTextParts.length > 0 && !country) {
                  const lastPart = secondPTextParts[secondPTextParts.length - 1];
                  // Check for 2-letter country code or common full country names
                  if (lastPart.match(/^[A-Z]{2}$/i) || ["US", "DE", "FR", "IN", "IE", "PH", "SG", "AU", "CA", "CH", "NL", "CO", "ES", "MX", "AR", "PL", "BR"].includes(lastPart.toUpperCase())) {
                      country = lastPart;
                      secondPTextParts.pop();
                  }
              }

              if (secondPTextParts.length > 0 && !postalCode) {
                  const lastPart = secondPTextParts[secondPTextParts.length - 1];
                  // Check for common postal code patterns (e.g., US zip, Canadian postal code)
                  if (lastPart.match(/^\d{5}(?:-\d{4})?$|^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i)) {
                      postalCode = lastPart;
                      secondPTextParts.pop();
                  }
              }

              if (secondPTextParts.length > 0 && !addressRegion) {
                  const lastPart = secondPTextParts[secondPTextParts.length - 1];
                  // Check for 2-letter state code or a longer region name
                  if (lastPart.match(/^[A-Z]{2}$/) || lastPart.length > 2) {
                      addressRegion = lastPart;
                      secondPTextParts.pop();
                  }
              }

              // Whatever remains should ideally be the addressLocality (city)
              if (secondPTextParts.length > 0 && !addressLocality) {
                  addressLocality = secondPTextParts.pop();
              }
          }
      }
  }

  const fullAddress = [
    streetAddress,
    addressLocality,
    addressRegion, // Added addressRegion to fullAddress construction
    postalCode,
    country
  ].filter(part => part).join(', ');

  // Fallback: If individual address components are still missing, try to extract them from fullAddress
  if (fullAddress && (!streetAddress || !addressLocality || !addressRegion || !postalCode || !country)) {
      console.log(`Fallback to full_address parsing initiated. full_address: "${fullAddress}"`);
      // Regex to split common address patterns: street, city, region, postalCode, country
      // This is a simplified regex and might need adjustments for very complex/varied address formats
      const parts = fullAddress.split(',').map(p => p.trim());
      console.log("Address parts:", parts);

      // Attempt to extract from 'parts' (heuristics based on common address formats)
      // Prioritize from right to left as country/postal code are often at the end

      if (parts.length > 0 && !country) {
          const lastPart = parts[parts.length - 1];
          if (lastPart.match(/^[A-Z]{2}$/i) || ["US", "DE", "FR", "IN", "IE", "PH", "SG", "AU", "CA", "CH", "NL", "CO", "ES", "MX", "AR", "PL", "BR"].includes(lastPart.toUpperCase())) {
              country = lastPart;
          }
      }

      if (parts.length > 0 && !postalCode) {
          const potentialPostalCode = parts.find(part => part.match(/^\d{5}(?:-\d{4})?$|^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i));
          if (potentialPostalCode) {
              postalCode = potentialPostalCode;
          }
      }

      if (parts.length > 0 && !addressRegion) {
        const potentialRegion = parts.find(part => part.match(/^[A-Z]{2}$/) || part.length > 2); // Two-letter state or longer region name
        if (potentialRegion && potentialRegion !== country && potentialRegion !== postalCode) { // Avoid re-using country or postalCode
          addressRegion = potentialRegion;
        }
      }

      // Remaining parts could be locality or street address
      const remainingParts = parts.filter(part => part !== country && part !== postalCode && part !== addressRegion);

      if (remainingParts.length > 0 && !addressLocality) {
          addressLocality = remainingParts[remainingParts.length - 1];
      }
      if (remainingParts.length > 1 && !streetAddress) {
          streetAddress = remainingParts.slice(0, remainingParts.length -1).join(', ');
      }
  }


  // Update the address object to use the newly extracted or defaulted values
  const updatedAddress = {
    streetAddress: streetAddress,
    addressLocality: addressLocality,
    addressRegion: addressRegion, // Added addressRegion to updatedAddress
    postalCode: postalCode,
    addressCountry: country
  };

  // Nombre d'employés et extraction des followers
  const employees = organization.numberOfEmployees?.value ?? "";
  let followers = organization.authorSubtitle?.replace(/[^0-9]/g, '') || '';
  if (!followers) {
     // Recherche spécifique dans l'élément affichant le nombre de followers (par exemple, l'en-tête de la page)
     const firstSublineMatch = html.match(/<h3[^>]*class="[^"]*top-card-layout__first-subline[^"]*"[^>]*>(.*?)<\/h3>/i);
     if (firstSublineMatch) {
        const followersMatch = firstSublineMatch[1].match(/([\d,\.]+)\s+followers/i);
        if (followersMatch) {
           followers = followersMatch[1].replace(/,/g, '');
        }
     }
     // Fallback sur l'ensemble du HTML si les followers n'ont toujours pas été extraits
     if (!followers) {
        const followerMatch = html.match(/([\d,\.]+)\s+followers/i);
        followers = followerMatch ? followerMatch[1].replace(/,/g, '') : '0';
     }
  }

  // Extraction de l'année de fondation ("Founded Year") en tant que variable numérique
  const foundedYearMatch = html.match(/<dt[^>]*>\s*Founded\s*<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
  const foundedYearText = foundedYearMatch ? foundedYearMatch[1].replace(/<[^>]+>/g, "").trim() : null;
  const foundedYear = foundedYearText ? parseInt(foundedYearText, 10) : null;
  // Extraction des spécialités
  const specialtiesMatch = html.match(/<dt[^>]*>\s*Specialties\s*<\/dt>[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/);
  const specialties = specialtiesMatch ? specialtiesMatch[1].replace(/<[^>]+>/g, "").trim() : "";
  // Extraction de l'industrie
  const industryMatch = html.match(/<dt[^>]*>\s*Industry\s*<\/dt>[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/);
  const industry = industryMatch ? industryMatch[1].replace(/<[^>]+>/g, "").trim() : "";
  // Extraction du siège social (Headquarters)
  const headquartersMatch = html.match(/<dt[^>]*>\s*Headquarters\s*<\/dt>[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/);
  const headquarters = headquartersMatch ? headquartersMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  // Extract company logo
  const companyLogo = organization.logo?.contentUrl ||
                      html.match(/<meta property="og:image" content="([^"]*)"/i)?.[1] ||
                      "";
    // Extract cover image
  const coverImageMatch = html.match(/<img class="cover-img__image[^>]*" src="([^"]*)"/i);
  let companyCoverImage = coverImageMatch ? coverImageMatch[1] : "";

  console.log(`Raw company cover image URL: ${companyCoverImage}`);

  // Decode HTML entities in the URL, specifically & to &
  // Using a simple string replace for compatibility in worker environments
  if (companyCoverImage) {
    companyCoverImage = companyCoverImage.replace(/&/g, '&');
  }
  console.log(`Decoded company cover image URL: ${companyCoverImage}`);

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
    company_address: {
      full_address: fullAddress,
      street_address: updatedAddress.streetAddress || "",
      address_locality: updatedAddress.addressLocality || "",
      address_region: updatedAddress.addressRegion || "", // Added address_region here
      postal_code: updatedAddress.postalCode || "",
      country: updatedAddress.addressCountry || ""
    },
    company_description: organization.description || "",
    number_of_employees: employees,
    followers: followers
  };
}

export function extractPublications(jsonLd) {
  const publications = jsonLd['@graph']?.filter(item =>
    item['@type'] === 'DiscussionForumPosting')?.map(post => ({
    date: new Date(post.datePublished).toISOString().split('T')[0],
    text: post.text?.trim() || 'No text',
    url: post.mainEntityOfPage || 'No URL'
  })) || [];
  return publications;
}

export function extractSimilarCompanies(html) {
  const similarPages = [];
  const links = html.match(/<a[^>]*href="([^"]*trk=similar-pages[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi);
  links?.forEach(linkHtml => {
     // Extraire l'URL du lien
     const urlMatch = linkHtml.match(/href="([^"]*trk=similar-pages[^"]*)"/i);
     const url = urlMatch ? urlMatch[1] : "No URL";
     const cleanUrl = url.split('?')[0];

     // Nettoyer le lien en supprimant les retours à la ligne pour faciliter l'extraction des balises
     const cleanedLink = linkHtml.replace(/\n/g, " ");

     // Essayer d'extraire directement les informations depuis les balises <h3> et <p>
     let name = "No name", industry = "No industry", location = "";
     const h3Match = cleanedLink.match(/<h3[^>]*>(.*?)<\/h3>/i);
     const subtitleMatch = cleanedLink.match(/<p[^>]*class="[^"]*base-aside-card__subtitle[^"]*"[^>]*>(.*?)<\/p>/i);
     const secondSubtitleMatch = cleanedLink.match(/<p[^>]*class="[^"]*base-aside-card__second-subtitle[^"]*"[^>]*>(.*?)<\/p>/i);
     if (h3Match) {
        name = h3Match[1].trim();
        name = name.replace(/<!---->/g, "").replace(/\s+/g, " ").trim();
     }
     if (subtitleMatch) {
        industry = subtitleMatch[1].trim();
     }
     if (secondSubtitleMatch) {
        location = secondSubtitleMatch[1].trim();
     }

     // Si ces informations ne sont pas extraites, fallback en utilisant une expression régulière plus robuste
     if (name === "No name") {
        const fallbackRegex = /([\w ,&\-'’]+)(?:\s*(?:\||-)\s*([\w ,&\-'’]+))?(?:\s*(?:\||-)\s*(.+))?/;
        const fallbackMatch = fallbackRegex.exec(cleanedLink); // Use exec instead of match for capturing groups
        if (fallbackMatch) {
           name = fallbackMatch[1] ? fallbackMatch[1].trim() : "No name";
           name = name.replace(/<!---->/g, "").replace(/\s+/g, " ").trim();
           industry = fallbackMatch[2] ? fallbackMatch[2].trim() : "No industry";
           location = fallbackMatch[3] ? fallbackMatch[3].trim() : "";
        } else {
           const strippedText = cleanedLink.replace(/<[^>]+>/g, " ")
                                           .replace(/\s+/g, " ")
                                           .trim();
           name = strippedText.replace(/<!---->/g, "").replace(/\s+/g, " ").trim();
        }
     }
     similarPages.push({ name, industry, location, url: cleanUrl });
  });
  return similarPages;
}
