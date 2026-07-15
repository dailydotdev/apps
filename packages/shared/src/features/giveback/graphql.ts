// Public campaign data shown on load: the funding status and the by-category
// pool breakdown come back in a single request so the hero and the causes
// breakdown render from one round trip.
//
// The sponsor wall (contributionSponsors) is commented out for now: nothing on
// the page renders GivebackSponsorTiers yet, so fetching it here just wastes a
// round trip. Re-enable the block and the $first variable once the sponsor wall
// is mounted.
export const CONTRIBUTION_OVERVIEW_QUERY = `
  query ContributionOverview {
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
    contributionCauseBreakdown {
      category
      points
    }
  }
`;

export const CONTRIBUTION_LEADERBOARD_QUERY = `
  query ContributionLeaderboard($first: Int, $withViewerRank: Boolean!) {
    contributionLeaderboard(first: $first) {
      edges {
        node {
          user {
            id
            name
            username
            image
          }
          points
          rank
        }
      }
    }
    contributionUserRank @include(if: $withViewerRank) {
      points
      rank
    }
  }
`;

// export const CONTRIBUTION_OVERVIEW_QUERY = `
//   query ContributionOverview($first: Int) {
//     ...
//     contributionSponsors(first: $first) {
//       edges {
//         node {
//           id
//           name
//           amountCents
//           url
//           logoUrl
//           tier
//         }
//       }
//     }
//   }
// `;

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
            assistType
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
          description
          thresholdPoints
          rewardType
          metadata
        }
      }
    }
    userContributionRewards(first: $first) {
      edges {
        node {
          tier {
            id
          }
        }
      }
    }
    # Founding-award state (campaign spot count + the visitor's own membership)
    # rides along on the journey query so the roadmap loads it in one request.
    contributionFoundingAward {
      totalSpots
      claimedCount
      isFoundingMember
      memberNumber
    }
  }
`;

// Grants the founding award to an eligible contributor (idempotent). Returns the
// founding-award shape carried by the actions query so the caller can update the
// cached journey data from one response.
export const CLAIM_CONTRIBUTION_FOUNDING_AWARD_MUTATION = `
  mutation ClaimContributionFoundingAward {
    claimContributionFoundingAward {
      totalSpots
      claimedCount
      isFoundingMember
      memberNumber
    }
  }
`;

// A randomized handful of targets for a link_pool action. Re-fetched to shuffle,
// so the user always has fresh threads to pick from.
export const CONTRIBUTION_ACTION_LINKS_QUERY = `
  query ContributionActionLinks($actionId: ID!, $limit: Int) {
    contributionActionLinks(actionId: $actionId, limit: $limit) {
      id
      url
      label
    }
  }
`;

export const CLAIM_CONTRIBUTION_REWARD_MUTATION = `
  mutation ClaimContributionReward($tierId: ID!) {
    claimContributionReward(tierId: $tierId) {
      tier {
        id
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

// Nominate a cause for the team to review. The backend doesn't store it — it
// posts the URL (and optional note) to Slack for a human decision.
export const SUGGEST_CONTRIBUTION_CAUSE_MUTATION = `
  mutation SuggestContributionCause($url: String!, $note: String) {
    suggestContributionCause(url: $url, note: $note) {
      _
    }
  }
`;

// Real-time community activity: every approved action lands here so the gift
// entry point can pop a live "+$" jump. `awardedPoints` maps 1:1 to USD, like
// the campaign totals.
export const CONTRIBUTION_ACTION_COMPLETED_SUBSCRIPTION = `
  subscription ContributionActionCompleted {
    contributionActionCompleted {
      submissionId
      userId
      actionId
      awardedPoints
    }
  }
`;

// The highest global milestone reached, served from cache for the gift-icon
// poll. Null until the first milestone is crossed. Drives the celebratory
// popover on the header/rail gift.
export const CONTRIBUTION_LAST_MILESTONE_QUERY = `
  query ContributionLastReachedMilestone {
    contributionLastReachedMilestone {
      id
      value
      title
      reachedAt
    }
  }
`;
