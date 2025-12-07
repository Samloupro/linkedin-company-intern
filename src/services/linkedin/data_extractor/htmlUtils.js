export function decodeHtmlEntities(text) {
  if (typeof text !== 'string') {
    return text;
  }

  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };

  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, match => entities[match]);
}
