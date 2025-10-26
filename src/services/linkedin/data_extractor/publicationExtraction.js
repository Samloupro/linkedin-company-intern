export function extractPublications(jsonLd) {
  const publications = jsonLd['@graph']?.filter(item =>
    item['@type'] === 'DiscussionForumPosting')?.map(post => ({
    date: new Date(post.datePublished).toISOString().split('T')[0],
    text: post.text?.trim() || 'No text',
    url: post.mainEntityOfPage || 'No URL'
  })) || [];
  return publications;
}
