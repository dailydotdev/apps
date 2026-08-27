// Frontend "Giveback" is the brand name for the backend "contribution"
// program. The campaign is closed, so only the shape behind the closing page's
// cause breakdown remains.

// The community pool grouped by cause category, as returned by
// `contributionCauseBreakdown`. Points map 1:1 to currency, so the donut renders
// them straight as dollars. `category` is null for the bucket of causes without
// one.
export interface ContributionCauseCategoryBreakdown {
  category: string | null;
  points: number;
}
