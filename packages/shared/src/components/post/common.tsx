import { ReactElement } from 'react';
import { ActionButtonsProps } from '../cards/ActionButtons';
import { PostModalActionsProps } from './PostModalActions';

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
  postFeedFiltersOnboarding: ReactElement;
  postPreviousNext: ReactElement;
  onPreviousPost: () => unknown;
  onNextPost: () => unknown;
  shouldDisplayTitle?: boolean;
  isModal?: boolean;
  className?: string;
}
