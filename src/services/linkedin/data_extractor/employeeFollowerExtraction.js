export function extractEmployeeAndFollowerData(html, organization) {
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

  return {
    employees: employees,
    followers: followers
  };
}
