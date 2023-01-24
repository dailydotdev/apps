import { ActionButtonsProps } from '../cards/ActionButtons';

export type PostCardTests = Pick<
  ActionButtonsProps,
  'postModalByDefault' | 'postEngagementNonClickable'
>;
