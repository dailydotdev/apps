import { ActionButtonsProps } from '../cards/ActionButtons';

export type PostCardTests = Pick<
  ActionButtonsProps,
  'postCardVersion' | 'postCardShareVersion' | 'postModalByDefault' | 'postEngagementNonClickable'
>;
