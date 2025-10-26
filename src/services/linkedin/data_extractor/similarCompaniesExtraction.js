import { decodeHtmlEntities } from './htmlUtils.js';

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
        name = decodeHtmlEntities(h3Match[1].trim());
        name = name.replace(/<!---->/g, "").replace(/\s+/g, " ").trim();
     }
     if (subtitleMatch) {
        industry = decodeHtmlEntities(subtitleMatch[1].trim());
     }
     if (secondSubtitleMatch) {
        location = decodeHtmlEntities(secondSubtitleMatch[1].trim());
     }

     // Si ces informations ne sont pas extraites, fallback en utilisant une expression régulière plus robuste
     if (name === "No name") {
        const fallbackRegex = /([\w ,&\-'’]+)(?:\s*(?:\||-)\s*([\w ,&\-'’]+))?(?:\s*(?:\||-)\s*(.+))?/;
        const fallbackMatch = fallbackRegex.exec(cleanedLink); // Use exec instead of match for capturing groups
        if (fallbackMatch) {
           name = fallbackMatch[1] ? decodeHtmlEntities(fallbackMatch[1].trim()) : "No name";
           name = name.replace(/<!---->/g, "").replace(/\s+/g, " ").trim();
           industry = fallbackMatch[2] ? decodeHtmlEntities(fallbackMatch[2].trim()) : "No industry";
           location = fallbackMatch[3] ? decodeHtmlEntities(fallbackMatch[3].trim()) : "";
        } else {
           const strippedText = decodeHtmlEntities(cleanedLink.replace(/<[^>]+>/g, " ")
                                           .replace(/\s+/g, " ")
                                           .trim());
           name = strippedText.replace(/<!---->/g, "").replace(/\s+/g, " ").trim();
        }
     }
     similarPages.push({ name, industry, location, url: cleanUrl });
  });
  return similarPages;
}
