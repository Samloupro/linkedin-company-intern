export function decodeHtmlEntities(text) {
  if (typeof text !== 'string') {
    return text;
  }
  // Use a temporary HTML entity decoding method suitable for Workers runtime
  // The simple replaceAll('&', '&') is the most direct fix for the current issue.
  // For other entities, similar replaceAll calls would be needed.
  return text.replace(/&/g, '&');
}
