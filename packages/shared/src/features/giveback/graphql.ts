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

// Everything the onboarded experience needs in one request: the action catalog,
// its filter categories, and the reward ladder. The catalog renders the grid and
// chips; the contribution summary and floating bar read the reward tiers — all
// from a single round trip. Each action carries the visitor's own state
// (completions, cooldown, latest submission) so the card knows whether it's
// actionable, in review or done.
export const CONTRIBUTION_ACTIONS_QUERY = `
  query ContributionActions($first: Int) {
    contributionActions(first: $first) {
      edges {
        node {
          id
          categoryId
          title
          description
          points
          evidence
          metadata {
            platform
            instructions
            externalUrl
            isLoveAction
          }
          cooldownSeconds
          maxPerUser
          userCooldownEndsAt
          userCompletions
          latestUserSubmission {
            id
            actionId
            status
            awardedPoints
            createdAt
            reviewedAt
          }
        }
      }
    }
    contributionActionCategories(first: $first) {
      edges {
        node {
          id
          title
        }
      }
    }
    contributionRewardTiers(first: $first) {
      edges {
        node {
          id
          title
          thresholdPoints
        }
      }
    }
  }
`;

// The Impact tab's personal recap in one request: where the visitor's funding
// landed (per-cause, finalized payments only) and the rewards they've claimed.
// Both are user-scoped and backend-gated, so this only fires once onboarded.
export const CONTRIBUTION_IMPACT_QUERY = `
  query ContributionImpact($first: Int) {
    userContributionCauseStats(first: $first) {
      edges {
        node {
          cause {
            id
            title
            url
            description
            category
            logoUrl
          }
          points
          amountCents
        }
      }
    }
    userContributionRewards(first: $first) {
      edges {
        node {
          tier {
            id
            title
            thresholdPoints
          }
          status
          claimedAt
          fulfilledAt
        }
      }
    }
  }
`;

export const SUBMIT_CONTRIBUTION_ACTION_MUTATION = `
  mutation SubmitContributionAction($input: SubmitContributionActionInput!) {
    submitContributionAction(input: $input) {
      id
      actionId
      status
      awardedPoints
      createdAt
      reviewedAt
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
