import {
  GivebackActionCategory,
  GivebackActionPersona,
  GivebackActionValidationType,
  GivebackUserActionStatus,
} from './types';

export const actionCategoryLabels: Record<GivebackActionCategory, string> = {
  [GivebackActionCategory.SocialMedia]: 'Social media',
  [GivebackActionCategory.CreatorContent]: 'Creator content',
  [GivebackActionCategory.Referrals]: 'Referrals',
  [GivebackActionCategory.ProductFeedback]: 'Product feedback',
  [GivebackActionCategory.CommunityPosts]: 'Community posts',
  [GivebackActionCategory.CommunityLove]: 'Community love',
};

export const actionPersonaLabels: Record<GivebackActionPersona, string> = {
  [GivebackActionPersona.Creator]: 'Creator',
  [GivebackActionPersona.Student]: 'Student',
  [GivebackActionPersona.SeniorDeveloper]: 'Senior developer',
  [GivebackActionPersona.PowerUser]: 'Power user',
  [GivebackActionPersona.CommunityMember]: 'Community member',
  [GivebackActionPersona.OpenSourceContributor]: 'Open-source contributor',
  [GivebackActionPersona.TeamLead]: 'Team lead',
  [GivebackActionPersona.DailyPlusSubscriber]: 'Daily Plus subscriber',
};

export const actionValidationLabels: Record<
  GivebackActionValidationType,
  string
> = {
  [GivebackActionValidationType.Automatic]: 'Automatic validation',
  [GivebackActionValidationType.Manual]: 'Manual review',
  [GivebackActionValidationType.Hybrid]: 'Hybrid validation',
  [GivebackActionValidationType.None]: 'No validation',
};

export const getUserActionStatusLabel = (
  status: GivebackUserActionStatus,
): string => {
  switch (status) {
    case GivebackUserActionStatus.NotStarted:
      return 'Available';
    case GivebackUserActionStatus.Started:
      return 'Started';
    case GivebackUserActionStatus.Submitted:
      return 'Submitted';
    case GivebackUserActionStatus.PendingReview:
      return 'Pending review';
    case GivebackUserActionStatus.AutoValidating:
      return 'Auto-validating';
    case GivebackUserActionStatus.Approved:
      return 'Approved';
    case GivebackUserActionStatus.Rejected:
      return 'Rejected';
    case GivebackUserActionStatus.Expired:
      return 'Expired';
    case GivebackUserActionStatus.NeedsMoreInfo:
      return 'Needs more info';
    case GivebackUserActionStatus.CountedTowardGoal:
      return 'Counted toward goal';
    default:
      return 'Available';
  }
};

export const getUserActionStatusClassName = (
  status: GivebackUserActionStatus,
): string => {
  switch (status) {
    case GivebackUserActionStatus.Approved:
    case GivebackUserActionStatus.CountedTowardGoal:
      return 'text-status-success';
    case GivebackUserActionStatus.PendingReview:
    case GivebackUserActionStatus.Submitted:
    case GivebackUserActionStatus.AutoValidating:
      return 'text-status-help';
    case GivebackUserActionStatus.Rejected:
      return 'text-status-error';
    case GivebackUserActionStatus.Expired:
    case GivebackUserActionStatus.NeedsMoreInfo:
      return 'text-text-tertiary';
    default:
      return 'text-text-secondary';
  }
};
