import { decodeHtmlEntities } from './htmlUtils.js';

const SIMILAR_PAGES_LINK_REGEX = /<a[^>]*href="([^"]*trk=similar-pages[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
const URL_MATCH_REGEX = /href="([^"]*trk=similar-pages[^"]*)"/i;
const H3_REGEX = /<h3[^>]*>(.*?)<\/h3>/i;
const SUBTITLE_REGEX = /<p[^>]*class="[^"]*base-aside-card__subtitle[^"]*"[^>]*>(.*?)<\/p>/i;
const SECOND_SUBTITLE_REGEX = /<p[^>]*class="[^"]*base-aside-card__second-subtitle[^"]*"[^>]*>(.*?)<\/p>/i;
const FALLBACK_REGEX = /([\w ,&\-'’]+)(?:\s*(?:\||-)\s*([\w ,&\-'’]+))?(?:\s*(?:\||-)\s*(.+))?/;
const CLEAN_TAGS_REGEX = /<[^>]+>/g;
const CLEAN_SPACES_REGEX = /\s+/g;
const CLEAN_COMMENTS_REGEX = /<!---->/g;


export function extractSimilarCompanies(html) {
   const similarPages = [];
   const links = html.match(SIMILAR_PAGES_LINK_REGEX);
   links?.forEach(linkHtml => {
      // Extraire l'URL du lien
      const urlMatch = linkHtml.match(URL_MATCH_REGEX);
      const url = urlMatch ? urlMatch[1] : "No URL";
      const cleanUrl = url.split('?')[0];

      // Nettoyer le lien en supprimant les retours à la ligne pour faciliter l'extraction des balises
      const cleanedLink = linkHtml.replace(/\n/g, " ");

      // Essayer d'extraire directement les informations depuis les balises <h3> et <p>
      let name = "No name", industry = "No industry", location = "";
      const h3Match = cleanedLink.match(H3_REGEX);
      const subtitleMatch = cleanedLink.match(SUBTITLE_REGEX);
      const secondSubtitleMatch = cleanedLink.match(SECOND_SUBTITLE_REGEX);
      if (h3Match) {
         name = decodeHtmlEntities(h3Match[1].trim());
         name = name.replace(CLEAN_COMMENTS_REGEX, "").replace(CLEAN_SPACES_REGEX, " ").trim();
      }
      if (subtitleMatch) {
         industry = decodeHtmlEntities(subtitleMatch[1].trim());
      }
      if (secondSubtitleMatch) {
         location = decodeHtmlEntities(secondSubtitleMatch[1].trim());
      }

      // Si ces informations ne sont pas extraites, fallback en utilisant une expression régulière plus robuste
      if (name === "No name") {
         const fallbackMatch = FALLBACK_REGEX.exec(cleanedLink); // Use exec instead of match for capturing groups
         if (fallbackMatch) {
            name = fallbackMatch[1] ? decodeHtmlEntities(fallbackMatch[1].trim()) : "No name";
            name = name.replace(CLEAN_COMMENTS_REGEX, "").replace(CLEAN_SPACES_REGEX, " ").trim();
            industry = fallbackMatch[2] ? decodeHtmlEntities(fallbackMatch[2].trim()) : "No industry";
            location = fallbackMatch[3] ? decodeHtmlEntities(fallbackMatch[3].trim()) : "";
         } else {
            const strippedText = decodeHtmlEntities(cleanedLink.replace(CLEAN_TAGS_REGEX, " ")
               .replace(CLEAN_SPACES_REGEX, " ")
               .trim());
            name = strippedText.replace(CLEAN_COMMENTS_REGEX, "").replace(CLEAN_SPACES_REGEX, " ").trim();
         }
      }
      similarPages.push({ name, industry, location, url: cleanUrl });
   });
   return similarPages;
}
