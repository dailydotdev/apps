import type { ProductPricingPreview } from '../../graphql/paddle';

/**
 * The smallest pack that covers `minCores`. When no pack is big enough, the
 * biggest one, since it gets the user closest.
 */
export const getRecommendedCorePrice = ({
  prices,
  minCores,
}: {
  prices?: ProductPricingPreview[];
  minCores?: number;
}): ProductPricingPreview | undefined => {
  if (!minCores || minCores <= 0 || !prices?.length) {
    return undefined;
  }

  const coresOf = (price: ProductPricingPreview): number =>
    price.metadata?.coresValue ?? 0;
  const packs = prices
    .filter((price) => coresOf(price) > 0)
    .sort((a, b) => coresOf(a) - coresOf(b));

  return (
    packs.find((price) => coresOf(price) >= minCores) ?? packs[packs.length - 1]
  );
};
