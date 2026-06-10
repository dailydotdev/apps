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

// The action catalog and its filter categories in one request: the catalog tab
// renders the grid and the filter chips from a single round trip. Each action
// carries the visitor's own state (completions, cooldown, latest submission) so
// the card knows whether it's actionable, in review or done.
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
  }
`;

// The reward ladder, used to show a contributor their next milestone. Auth +
// eligibility gated like the rest of the onboarded experience.
export const CONTRIBUTION_REWARD_TIERS_QUERY = `
  query ContributionRewardTiers($first: Int) {
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
