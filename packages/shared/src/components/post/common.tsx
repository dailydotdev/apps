import { ReactElement } from 'react';
import { ActionButtonsProps } from '../cards/ActionButtons';
import { PostModalActionsProps } from './PostModalActions';
import { ArticleOnboardingVersion } from '../../lib/featureValues';

export type PostCardTests = Pick<
  ActionButtonsProps,
  | 'postCardVersion'
  | 'postCardShareVersion'
  | 'postModalByDefault'
  | 'postEngagementNonClickable'
>;

export interface PostNavigationProps
  extends Pick<
    PostModalActionsProps,
    'post' | 'onClose' | 'onShare' | 'onBookmark' | 'onReadArticle'
  > {
  articleOnboardingVersion: ArticleOnboardingVersion;
  postFeedFiltersOnboarding: ReactElement;
  postPreviousNext: ReactElement;
  onPreviousPost: () => unknown;
  onNextPost: () => unknown;
  shouldDisplayTitle?: boolean;
  isModal?: boolean;
  className?: string;
}
