import { Feed } from '../../../graphql/feed';
import { OnSelectTagProps } from '../../tags/common';

export type FeedSettingsFormData = {
  name: string;
  icon?: string;
} & Pick<
  Feed['flags'],
  | 'orderBy'
  | 'minDayRange'
  | 'minUpvotes'
  | 'minViews'
  | 'disableEngagementFilter'
>;

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
  General = 'general',
  Tags = 'tags',
  ContentSources = 'sources',
  ContentPreferences = 'preferences',
  AI = 'ai',
  Filters = 'filters',
  Blocking = 'blocking',
}

export const feedSettingsMenuTitle: Record<FeedSettingsMenu, string> =
  Object.freeze({
    [FeedSettingsMenu.General]: 'General',
    [FeedSettingsMenu.Tags]: 'Tags',
    [FeedSettingsMenu.ContentSources]: 'Content sources',
    [FeedSettingsMenu.ContentPreferences]: 'Content preferences',
    [FeedSettingsMenu.AI]: 'AI superpowers',
    [FeedSettingsMenu.Filters]: 'Filters',
    [FeedSettingsMenu.Blocking]: 'Blocked content',
  });
