// fundingExtraction.js
export function extractFunding(htmlString) {
  console.log("Funding - Started extractFunding. Input htmlString length:", htmlString.length);
  console.log("Funding - Raw HTML String received (first 500 chars):", htmlString.substring(0, 500));
  console.log("Funding - Raw HTML String received (last 500 chars):", htmlString.substring(htmlString.length - 500));

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
  let totalRoundsLinkMatch = htmlString.match(/aria-label="[^"]*(\d+)\s+total rounds"/i);
  if (!totalRoundsLinkMatch) {
    totalRoundsLinkMatch = htmlString.match(/<span class="before:middot">\s*(\d+)\s+total rounds\s*<\/span>/i);
  }
  console.log("Funding - Total Rounds Match (after both attempts):", totalRoundsLinkMatch);

  if (totalRoundsLinkMatch && totalRoundsLinkMatch[1]) {
    fundingData.Funding.total_funding_rounds = parseInt(totalRoundsLinkMatch[1], 10);
    console.log("Funding - Extracted Total Rounds:", fundingData.Funding.total_funding_rounds);
  }


  // 2. Last Round Details - Container for last round info
  const lastRoundContainerMatch = htmlString.match(/<div class="my-2">([\s\S]*?)<\/div>/i);
  console.log("Funding - Last Round Container Match (full match[0]):", lastRoundContainerMatch ? lastRoundContainerMatch[0] : null);
  console.log("Funding - Last Round Container Match (content match[1]):", lastRoundContainerMatch ? lastRoundContainerMatch[1] : null);


  if (lastRoundContainerMatch && lastRoundContainerMatch[1]) {
    const lastRoundContent = lastRoundContainerMatch[1];
    console.log("Funding - Last Round Content for sub-extraction:", lastRoundContent);


    // Last Round - Series and Date (from the 'a' tag)
    const lastRoundLinkMatch = lastRoundContent.match(/<a[^>]*data-tracking-control-name="funding_last-round"[^>]*>([\s\S]*?)<\/a>/i);
    console.log("Funding - Last Round Link Match:", lastRoundLinkMatch);

    if (lastRoundLinkMatch && lastRoundLinkMatch[1]) {
      const linkText = lastRoundLinkMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
      console.log("Funding - Last Round Link Text Cleaned:", linkText);


      const seriesMatch = linkText.match(/Series\s+([^(\s]+)/i);
      if (seriesMatch && seriesMatch[1]) {
        fundingData.Funding.last_round.series = seriesMatch[1].trim();
      } else if (linkText.includes("Series unknown")) {
        fundingData.Funding.last_round.series = "unknown";
      }
      console.log("Funding - Extracted Series:", fundingData.Funding.last_round.series);


      const dateMatch = linkText.match(/(\w{3}\s+\d{1,2},\s+\d{4})/);
      if (dateMatch && dateMatch[1]) {
        fundingData.Funding.last_round.date = dateMatch[1].trim();
      }
      console.log("Funding - Extracted Date:", fundingData.Funding.last_round.date);
    }

    // Last Round - Funding Amount (Refined)
    // Search in the whole HTML string as it might be outside lastRoundContent
    const fundingAmountMatch = htmlString.match(/<p class="text-display-lg">\s*(US\$\s*[\d\.]+[MKB]?)\s*<\/p>/i);
    console.log("Funding - Funding Amount Match (full HTML search):", fundingAmountMatch);
    if (fundingAmountMatch && fundingAmountMatch[1]) {
      fundingData.Funding.last_round.funding_amount = fundingAmountMatch[1].trim();
      console.log("Funding - Extracted Funding Amount:", fundingData.Funding.last_round.funding_amount);
    }
  }

  // 3. Investors (Refined)
  const investorsContainerMatch = htmlString.match(/<div class="mb-2">\s*<p class="text-color-text-secondary text-sm">\s*Investors\s*<\/p>([\s\S]*?)<\/div>/i);
  console.log("Funding - Investors Container Match:", investorsContainerMatch ? investorsContainerMatch[0] : null);

  if (investorsContainerMatch && investorsContainerMatch[1]) {
    const investorsContent = investorsContainerMatch[1];
    console.log("Funding - Investors Content for sub-extraction:", investorsContent);

    // Using matchAll for multiple captures and then iterating
    const investorATags = investorsContent.matchAll(/<a[^>]*data-tracking-control-name="funding_investors"[^>]*>([\s\S]*?)<\/a>/gi);
    console.log("Funding - Raw Investor a-tags found:", Array.from(investorATags).map(m => m[0])); // Log raw tags

    // Re-run matchAll for processing as iterators can only be consumed once
    const investorTextMatches = investorsContent.matchAll(/<a[^>]*data-tracking-control-name="funding_investors"[^>]*>([\s\S]*?)<\/a>/gi);

    for (const match of investorTextMatches) {
      const investorName = match[1].replace(/<img[^>]*>/i, '').replace(/<[^>]+>/g, '').trim();
      if (investorName) {
        fundingData.Funding.investors.push(investorName);
      }
    }
    console.log("Funding - Extracted Investors:", fundingData.Funding.investors);
  }

  console.log("Funding - Final fundingData before return from fundingExtraction.js:", JSON.stringify(fundingData, null, 2));
  return fundingData;
}
