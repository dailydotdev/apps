export interface FilterOnboardingProps {
  onSelectedTopics?(tags: Record<string, boolean>): void;
  shouldUpdateAlerts?: boolean;
  className?: string;
  shouldFilterLocally?: boolean;
  feedId?: string;
}
