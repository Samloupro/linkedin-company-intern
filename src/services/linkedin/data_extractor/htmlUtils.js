export function decodeHtmlEntities(text) {
  if (typeof text !== 'string') {
    return text;
  }

  // Replace encoded HTML entities like &amp; with real symbols
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
