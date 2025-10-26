// fundingExtraction.js
export function extractFunding(htmlString) {
  const fundingData = {
    Funding: {
      total_funding_rounds: null,
      last_round: {
        series: null,
        date: null,
        funding_amount: null,
      },
      investors: [],
    },
  };

  // 1. Total Funding Rounds (Confirmed working)
  let totalRoundsMatch = htmlString.match(/aria-label="[^"]*(\d+)\s+total rounds"/i);
  if (!totalRoundsMatch) {
    totalRoundsMatch = htmlString.match(/<span class="before:middot">\s*(\d+)\s+total rounds\s*<\/span>/i);
  }
  if (totalRoundsMatch && totalRoundsMatch[1]) {
    fundingData.Funding.total_funding_rounds = parseInt(totalRoundsMatch[1], 10);
  }

  // 2. Last Round - Series and Date (Confirmed working)
  const lastRoundLinkMatch = htmlString.match(/<a[^>]*data-tracking-control-name="funding_last-round"[^>]*>([\s\S]*?)<\/a>/i);
  if (lastRoundLinkMatch && lastRoundLinkMatch[1]) {
    const linkText = lastRoundLinkMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    const seriesMatch = linkText.match(/Series\s+([^(\s]+)/i);
    if (seriesMatch && seriesMatch[1]) {
      fundingData.Funding.last_round.series = seriesMatch[1].trim();
    } else if (linkText.includes("Series unknown")) {
      fundingData.Funding.last_round.series = "unknown";
    }
    const dateMatch = linkText.match(/(\w{3}\s+\d{1,2},\s+\d{4})/);
    if (dateMatch && dateMatch[1]) {
      fundingData.Funding.last_round.date = dateMatch[1].trim();
    }
  }
  
  // 3. Last Round - Funding Amount (Refined)
  const fundingAmountMatch = htmlString.match(/<p class="text-display-lg">\s*(US\$\s*[\d\.]+[MKB]?)\s*<\/p>/i);
  if (fundingAmountMatch && fundingAmountMatch[1]) {
    fundingData.Funding.last_round.funding_amount = fundingAmountMatch[1].trim();
  }

  // 4. Investors (Refined)
  const investorMatches = htmlString.matchAll(/<a[^>]*data-tracking-control-name="funding_investors"[^>]*>([\s\S]*?)<\/a>/gi);
  for (const match of investorMatches) {
    const investorName = match[1].replace(/<img[^>]*>/, "").replace(/<[^>]+>/g, "").trim();
    if (investorName) {
      fundingData.Funding.investors.push(investorName);
    }
  }

  return fundingData;
}
