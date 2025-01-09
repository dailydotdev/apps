import type { Tag } from '../../graphql/feedSettings';

export type OnSelectTagProps = {
  tag: Tag;
  action: 'follow' | 'unfollow';
};
