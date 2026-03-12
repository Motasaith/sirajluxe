import type { IShippingZone } from "./models/settings";

/**
 * Calculate shipping cost based on country, subtotal, and configured zones.
 * Falls back to the flat rate / free-shipping-threshold when no zone matches.
 */
export function calculateShipping({
  country,
  subtotalPence,
  shippingZones,
  flatRatePence,
  freeThresholdPence,
}: {
  country: string;
  subtotalPence: number;
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
    const zoneFreeThreshold = Math.round(zone.minOrderFree * 100);
    if (zoneFreeThreshold > 0 && subtotalPence >= zoneFreeThreshold) {
      return 0;
    }
    return Math.round(zone.rate * 100);
  }

  // Fallback to global flat rate
  if (freeThresholdPence > 0 && subtotalPence >= freeThresholdPence) {
    return 0;
  }
  return flatRatePence;
}
