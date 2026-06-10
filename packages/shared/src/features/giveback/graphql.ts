// Public campaign data shown on load: the funding status and the sponsor wall
// come back in a single request so the hero renders from one round trip.
export const CONTRIBUTION_OVERVIEW_QUERY = `
  query ContributionOverview($first: Int) {
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
    contributionSponsors(first: $first) {
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

// The cause picker needs the catalog and the visitor's saved picks together, so
// they share one request fired when the visitor opts in.
export const CONTRIBUTION_CAUSE_PICKER_QUERY = `
  query ContributionCausePicker($first: Int) {
    contributionCauses(first: $first) {
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
    contributionCausePreferences(first: $first) {
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
