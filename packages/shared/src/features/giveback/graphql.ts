// The campaign is closed, so the only query left is the public by-category pool
// breakdown the closing page shows.
export const CONTRIBUTION_CAUSE_BREAKDOWN_QUERY = `
  query ContributionCauseBreakdown {
    contributionCauseBreakdown {
      category
      points
    }
  }
`;
