const NON_DIGIT_REGEX = /[^0-9]/g;
const FOLLOWERS_SUBLINE_REGEX = /<h3[^>]*class="[^"]*top-card-layout__first-subline[^"]*"[^>]*>(.*?)<\/h3>/i;
const FOLLOWERS_MATCH_REGEX = /([\d,\.]+)\s+followers/i;
const COMMA_REGEX = /,/g;

export function extractEmployeeAndFollowerData(html, organization) {
   // Nombre d'employés et extraction des followers
   const employees = organization.numberOfEmployees?.value ?? "";
   let followers = organization.authorSubtitle?.replace(NON_DIGIT_REGEX, '') || '';
   if (!followers) {
      // Recherche spécifique dans l'élément affichant le nombre de followers (par exemple, l'en-tête de la page)
      const firstSublineMatch = html.match(FOLLOWERS_SUBLINE_REGEX);
      if (firstSublineMatch) {
         const followersMatch = firstSublineMatch[1].match(FOLLOWERS_MATCH_REGEX);
         if (followersMatch) {
            followers = followersMatch[1].replace(COMMA_REGEX, '');
         }
      }
      // Fallback sur l'ensemble du HTML si les followers n'ont toujours pas été extraits
      if (!followers) {
         const followerMatch = html.match(FOLLOWERS_MATCH_REGEX);
         followers = followerMatch ? followerMatch[1].replace(COMMA_REGEX, '') : '0';
      }
   }

   return {
      employees: employees,
      followers: followers
   };
}
