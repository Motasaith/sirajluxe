import type { ITaxRule } from "./models/settings";

/**
 * Calculate tax based on shipping country, using tax rules or fallback rate.
 * Returns tax amount in pence and the matched rule details.
 */
export function calculateTax({
    country,
    subtotalPence,
    discountPence,
    taxRules,
    fallbackRate,
}: {
    country: string;
    subtotalPence: number;
    discountPence: number;
    taxRules: ITaxRule[];
    fallbackRate: number;
}): { taxPence: number; taxName: string; taxRate: number } {
    const countryUpper = (country || "").toUpperCase();
    const taxableAmount = Math.max(0, subtotalPence - discountPence);

    // Try to match a tax rule by country code
    const rule = taxRules.find(
        (r) => r.country.toUpperCase() === countryUpper
    );

    if (rule && rule.rate > 0) {
        return {
            taxPence: Math.round(taxableAmount * (rule.rate / 100)),
            taxName: rule.name,
            taxRate: rule.rate,
        };
    }

    // Fallback to global flat rate
    if (fallbackRate > 0) {
        return {
            taxPence: Math.round(taxableAmount * (fallbackRate / 100)),
            taxName: "Tax",
            taxRate: fallbackRate,
        };
    }

    return { taxPence: 0, taxName: "", taxRate: 0 };
}
