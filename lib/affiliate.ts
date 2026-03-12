/**
 * AFFILIATE STRATEGY
 *
 * Goal: Help users buy the CORRECT rootable SKU and earn commission.
 * Anti-goal: Never trick users into buying locked variants.
 *
 * Rules:
 * 1. Only show affiliate links on variants with score >= 75
 * 2. Only show on variants with unlockable_bootloader tag
 * 3. Affiliate URL must point to the EXACT rootable model (e.g. SM-G973F, not "Galaxy S10")
 * 4. Display a clear "This is an affiliate link" disclaimer
 * 5. Never show affiliate links on locked_bootloader variants
 *
 * Where affiliate URLs come from:
 * - Set manually per-variant in data/devices/[brand]/[series]/[codename].yml
 * - The `affiliate_url` field on a variant object
 * - These YAML files live in the PRIVATE rootdb-xyz/data repo
 *
 * Supported affiliate programs (add as you go):
 * - Amazon Associates (best for phones)
 * - eBay Partner Network
 * - AliExpress affiliate
 * - Swappa affiliate (used phones)
 *
 * URL format: Store the full affiliate URL in YAML.
 * Example:
 *   affiliate_url: "https://www.amazon.com/dp/B0XXXXXX?tag=rootdb-20"
 */

export interface AffiliateDisplay {
  show: boolean;
  url: string;
  label: string;
  disclaimer: string;
}

export function getAffiliateDisplay(
  score: number,
  tags: string[],
  affiliateUrl?: string
): AffiliateDisplay {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_AFFILIATES === "true";

  if (
    !enabled ||
    !affiliateUrl ||
    score < 75 ||
    tags.includes("locked_bootloader")
  ) {
    return { show: false, url: "", label: "", disclaimer: "" };
  }

  return {
    show: true,
    url: affiliateUrl,
    label: "Buy This Rootable SKU",
    disclaimer:
      "This is an affiliate link. RootDB earns a small commission at no extra cost to you. We only link to confirmed rootable models.",
  };
}