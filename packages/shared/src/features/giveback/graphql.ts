export const CONTRIBUTION_STATUS_QUERY = `
  query ContributionStatus {
    contributionStatus {
      enabled
      eligible
      currentCyclePoints
      currentCycleTargetPoints
      lifetimePoints
      lifetimeAmountCents
      contributorsCount
      userPoints
    }
  }
`;

export const CONTRIBUTION_SPONSORS_QUERY = `
  query ContributionSponsors($first: Int, $after: String) {
    contributionSponsors(first: $first, after: $after) {
      edges {
        node {
          id
          name
          amountCents
          url
          logoUrl
          tier
        }
      }
    }
  }
`;
