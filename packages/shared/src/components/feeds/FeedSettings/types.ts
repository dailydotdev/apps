import { Feed } from '../../../graphql/feed';
import { OnSelectTagProps } from '../../tags/common';

export type FeedSettingsFormData = {
  name: string;
  icon?: string;
};

export type FeedSettingsEditContextValue = {
  feed?: Feed;
  data: FeedSettingsFormData;
  setData: (data: Partial<FeedSettingsFormData>) => void;
  onSubmit: () => Promise<Feed>;
  isSubmitPending: boolean;
  onDelete: () => Promise<Pick<Feed, 'id'>>;
  deleteStatus: 'idle' | 'pending' | 'success' | 'error';
  onTagClick: (props: OnSelectTagProps) => void;
  onDiscard: () => Promise<boolean>;
  isDirty: boolean;
};

export enum FeedSettingsMenu {
  General = 'General',
  Tags = 'Tags',
  ContentSources = 'Content Sources',
  ContentPreferences = 'Content Preferences',
  AI = 'AI superpowers',
  Filters = 'Filters',
  Blocking = 'Blocked content',
}
