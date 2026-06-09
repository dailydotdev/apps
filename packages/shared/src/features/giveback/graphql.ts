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

export const CONTRIBUTION_CAUSES_QUERY = `
  query ContributionCauses($first: Int, $after: String) {
    contributionCauses(first: $first, after: $after) {
      edges {
        node {
          id
          title
          url
          description
          category
          logoUrl
        }
      }
    }
  }
`;

export const CONTRIBUTION_CAUSE_PREFERENCES_QUERY = `
  query ContributionCausePreferences($first: Int, $after: String) {
    contributionCausePreferences(first: $first, after: $after) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

export const UPDATE_CONTRIBUTION_CAUSE_PREFERENCES_MUTATION = `
  mutation UpdateContributionCausePreferences($causeIds: [ID!]!) {
    updateContributionCausePreferences(causeIds: $causeIds) {
      _
    }
  }
`;
