import { FeedbackCategory, FeedbackStatus } from '../graphql/feedback';

// Authors see spam as a plain close; the real reason stays with the team
export const getFeedbackStatusLabel = (
  status: FeedbackStatus,
  isTeamView = false,
): string => {
  switch (status) {
    case FeedbackStatus.Pending:
      return 'Submitted';
    case FeedbackStatus.Processing:
      return 'Under Review';
    case FeedbackStatus.Accepted:
      return 'Acknowledged';
    case FeedbackStatus.Completed:
      return 'Resolved';
    case FeedbackStatus.Cancelled:
      return 'Closed';
    case FeedbackStatus.Spam:
      return isTeamView ? 'Spam' : 'Closed';
    case FeedbackStatus.Failed:
      return 'Needs review';
    default:
      return 'Submitted';
  }
};

export const isFeedbackClosed = (status: FeedbackStatus): boolean =>
  [
    FeedbackStatus.Completed,
    FeedbackStatus.Cancelled,
    FeedbackStatus.Spam,
  ].includes(status);

export const getFeedbackThreadPath = ({
  id,
  team,
}: {
  id: string;
  team?: boolean;
}): string => `/${team ? 'team' : 'settings'}/feedback/${id}`;

export const getFeedbackStatusClassName = (status: FeedbackStatus): string => {
  switch (status) {
    case FeedbackStatus.Pending:
      return 'text-text-tertiary';
    case FeedbackStatus.Processing:
    case FeedbackStatus.Accepted:
      return 'text-theme-color-blueCheese';
    case FeedbackStatus.Completed:
      return 'text-theme-color-avocado';
    case FeedbackStatus.Cancelled:
    case FeedbackStatus.Spam:
      return 'text-text-tertiary';
    case FeedbackStatus.Failed:
      return 'text-status-error';
    default:
      return 'text-text-tertiary';
  }
};

export const getFeedbackCategoryLabel = (
  category: FeedbackCategory,
): string => {
  switch (category) {
    case FeedbackCategory.BugReport:
      return 'Bug Report';
    case FeedbackCategory.FeatureRequest:
      return 'Feature Request';
    case FeedbackCategory.UxIssue:
      return 'UX Issue';
    case FeedbackCategory.PerformanceComplaint:
      return 'Performance';
    case FeedbackCategory.ContentQuality:
      return 'Content Quality';
    default:
      return 'General';
  }
};
