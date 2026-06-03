import { gql } from 'graphql-request';

/**
 * Fetches the full list of marketing CTAs of a given variant for the current user.
 *
 * Pair with `useMarketingCtas(variant)` — the hook gates this query on
 * `boot.marketingCtaVariants` so it only fires when the user is actually targeted.
 */
export const MARKETING_CTAS_BY_VARIANT_QUERY = gql`
  query MarketingCtasByVariant($variant: String!) {
    marketingCtasByVariant(variant: $variant) {
      campaignId
      createdAt
      variant
      flags {
        title
        description
        image
        tagText
        tagColor
        ctaUrl
        ctaText
      }
      targets {
        webapp
        extension
        ios
      }
    }
  }
`;
