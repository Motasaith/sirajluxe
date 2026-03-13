import type { IShippingZone } from "./models/settings";

/**
 * Fetch live rates from Carrier APIs (Dummy implementations)
 */
export async function getLiveCarrierRates(weightKg: number, destinationCountry: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const isUK = destinationCountry.toUpperCase() === "GB" || destinationCountry.toUpperCase() === "UK";
  const baseRate = isUK ? 300 : 1200; // 3.00 GBP or 12.00 GBP base
  const weightSurcharge = Math.ceil((weightKg || 1) * 150); // 1.50 per kg

  return {
    royalMail: baseRate + weightSurcharge,
    dpd: baseRate + weightSurcharge + 200, // DPD slightly more expensive
    evri: baseRate + weightSurcharge - 50, // Evri slightly cheaper
  };
}

/**
 * Calculate shipping cost based on country, subtotal, total weight, and configured zones.
 * Priority: zone weight-tier rate > zone flat rate > global free threshold / flat rate.
 */
export function calculateShipping({
  country,
  subtotalPence,
  totalWeightKg,
  shippingZones,
  flatRatePence,
  freeThresholdPence,
}: {
  country: string;
  subtotalPence: number;
  totalWeightKg?: number;
  shippingZones: IShippingZone[];
  flatRatePence: number;
  freeThresholdPence: number;
}): number {
  // Try to match a shipping zone by country code
  const countryUpper = (country || "").toUpperCase();
  const zone = shippingZones.find((z) =>
    z.countries.some((c) => c.toUpperCase() === countryUpper)
  );

  if (zone) {
    // Check free-shipping threshold for this zone
    const zoneFreeThreshold = Math.round(zone.minOrderFree * 100);
    if (zoneFreeThreshold > 0 && subtotalPence >= zoneFreeThreshold) {
      return 0;
    }

    // Check weight-based tiers (sorted ascending by maxWeight)
    if (
      totalWeightKg &&
      totalWeightKg > 0 &&
      zone.weightTiers &&
      zone.weightTiers.length > 0
    ) {
      const sortedTiers = [...zone.weightTiers].sort(
        (a, b) => a.maxWeight - b.maxWeight
      );
      for (const tier of sortedTiers) {
        if (totalWeightKg <= tier.maxWeight) {
          return Math.round(tier.rate * 100);
        }
      }
      // Weight exceeds all tiers → use the highest tier's rate
      return Math.round(sortedTiers[sortedTiers.length - 1].rate * 100);
    }

    // Fallback to zone flat rate
    return Math.round(zone.rate * 100);
  }

  // Fallback to global flat rate
  if (freeThresholdPence > 0 && subtotalPence >= freeThresholdPence) {
    return 0;
  }
  return flatRatePence;
}
