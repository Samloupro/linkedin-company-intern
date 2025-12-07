import { decodeHtmlEntities } from './htmlUtils.js';

const ADDRESS_DIV_REGEX = /<div[^>]*id="address-0"[^>]*>([\s\S]*?)<\/div>/i;
const P_TAGS_REGEX = /<p>([\s\S]*?)<\/p>/gi;
const TAGS_STRIP_REGEX = /<[^>]+>/g;
const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/i;
const POSTAL_CODE_REGEX = /^\d{5}(?:-\d{4})?$|^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
const REGION_CODE_REGEX = /^[A-Z]{2}$/;


export function extractAddressDetails(html, jsonLd, organization) {
    let streetAddress = organization.address?.streetAddress || "";
    let addressLocality = organization.address?.addressLocality || "";
    let addressRegion = organization.address?.addressRegion || "";
    let postalCode = organization.address?.postalCode || "";
    let country = organization.address?.addressCountry || "";

    // Fallback to HTML parsing if JSON-LD address components are missing
    if (!streetAddress || !addressLocality || !addressRegion || !postalCode || !country) {
        console.log("HTML parsing fallback for address initiated.");
        const addressDivMatch = html.match(ADDRESS_DIV_REGEX);
        if (addressDivMatch && addressDivMatch[1]) {
            const pTags = addressDivMatch[1].match(P_TAGS_REGEX);
            if (pTags && pTags.length >= 2) {
                streetAddress = streetAddress || decodeHtmlEntities(pTags[0].replace(TAGS_STRIP_REGEX, "").trim());

                const secondPTextContent = decodeHtmlEntities(pTags[1].replace(TAGS_STRIP_REGEX, "").trim());
                const secondPTextParts = secondPTextContent.split(',').map(part => part.trim()).filter(part => part !== '');

                if (secondPTextParts.length > 0 && !country) {
                    const lastPart = secondPTextParts[secondPTextParts.length - 1];
                    if (lastPart.match(COUNTRY_CODE_REGEX) || ["US", "DE", "FR", "IN", "IE", "PH", "SG", "AU", "CA", "CH", "NL", "CO", "ES", "MX", "AR", "PL", "BR"].includes(lastPart.toUpperCase())) {
                        country = lastPart;
                        secondPTextParts.pop();
                    }
                }

                if (secondPTextParts.length > 0 && !postalCode) {
                    const lastPart = secondPTextParts[secondPTextParts.length - 1];
                    if (lastPart.match(POSTAL_CODE_REGEX)) {
                        postalCode = lastPart;
                        secondPTextParts.pop();
                    }
                }

                if (secondPTextParts.length > 0 && !addressRegion) {
                    const lastPart = secondPTextParts[secondPTextParts.length - 1];
                    if (lastPart.match(REGION_CODE_REGEX) || lastPart.length > 2) {
                        addressRegion = lastPart;
                        secondPTextParts.pop();
                    }
                }

                if (secondPTextParts.length > 0 && !addressLocality) {
                    addressLocality = secondPTextParts.pop();
                }
            }
        }
    }

    const fullAddress = [
        streetAddress,
        addressLocality,
        addressRegion,
        postalCode,
        country
    ].filter(part => part).join(', ');

    // Fallback: If individual address components are still missing, try to extract them from fullAddress
    if (fullAddress && (!streetAddress || !addressLocality || !addressRegion || !postalCode || !country)) {
        console.log(`Fallback to full_address parsing initiated. full_address: "${fullAddress}"`);
        const parts = fullAddress.split(',').map(p => p.trim());
        console.log("Address parts:", parts);

        if (parts.length > 0 && !country) {
            const lastPart = parts[parts.length - 1];
            if (lastPart.match(COUNTRY_CODE_REGEX) || ["US", "DE", "FR", "IN", "IE", "PH", "SG", "AU", "CA", "CH", "NL", "CO", "ES", "MX", "AR", "PL", "BR"].includes(lastPart.toUpperCase())) {
                country = lastPart;
            }
        }

        if (parts.length > 0 && !postalCode) {
            const potentialPostalCode = parts.find(part => part.match(POSTAL_CODE_REGEX));
            if (potentialPostalCode) {
                postalCode = potentialPostalCode;
            }
        }

        if (parts.length > 0 && !addressRegion) {
            const potentialRegion = parts.find(part => part.match(REGION_CODE_REGEX) || part.length > 2);
            if (potentialRegion && potentialRegion !== country && potentialRegion !== postalCode) {
                addressRegion = potentialRegion;
            }
        }

        const remainingParts = parts.filter(part => part !== country && part !== postalCode && part !== addressRegion);

        if (remainingParts.length > 0 && !addressLocality) {
            addressLocality = remainingParts[remainingParts.length - 1];
        }
        if (remainingParts.length > 1 && !streetAddress) {
            streetAddress = remainingParts.slice(0, remainingParts.length - 1).join(', ');
        }
    }

    return {
        full_address: fullAddress,
        street_address: streetAddress || "",
        address_locality: addressLocality || "",
        address_region: addressRegion || "",
        postal_code: postalCode || "",
        country: country || ""
    };
}
