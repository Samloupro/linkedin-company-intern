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

  // 1. Total Funding Rounds
  const totalRoundsLinkMatch = htmlString.match(/aria-label="[^"]*(\d+)\s+total rounds"/i);
  if (totalRoundsLinkMatch && totalRoundsLinkMatch[1]) {
    fundingData.Funding.total_funding_rounds = parseInt(totalRoundsLinkMatch[1], 10);
  }

  // 2. Last Round Details - Container for last round info
  const lastRoundContainerMatch = htmlString.match(/<div class="my-2">([\s\S]*?)<\/div>/i);
  if (lastRoundContainerMatch && lastRoundContainerMatch[1]) {
    const lastRoundContent = lastRoundContainerMatch[1];

    // Last Round - Series and Date (from the 'a' tag)
    const lastRoundLinkMatch = lastRoundContent.match(/<a[^>]*data-tracking-control-name="funding_last-round"[^>]*>([\s\S]*?)<\/a>/i);
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

    // Last Round - Funding Amount
    const fundingAmountMatch = lastRoundContent.match(/<p class="text-display-lg">([\s\S]*?)<\/p>/i);
    if (fundingAmountMatch && fundingAmountMatch[1]) {
      fundingData.Funding.last_round.funding_amount = fundingAmountMatch[1].trim();
    }
  }

  // 3. Investors
  const investorsContainerMatch = htmlString.match(/<div class="mb-2">\s*<p class="text-color-text-secondary text-sm">\s*Investors\s*<\/p>([\s\S]*?)<\/div>/i);
  if (investorsContainerMatch && investorsContainerMatch[1]) {
    const investorsContent = investorsContainerMatch[1];
    const investorMatches = investorsContent.matchAll(/<a[^>]*data-tracking-control-name="funding_investors"[^>]*>([\s\S]*?)<\/a>/gi);

    for (const match of investorMatches) {
      const investorName = match[1].replace(/<img[\s\S]*?>/i, '').replace(/<[^>]+>/g, '').trim();
      if (investorName) {
        fundingData.Funding.investors.push(investorName);
      }
    }
  }

  return fundingData;
}
