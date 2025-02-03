import type { Feed } from '../../../graphql/feed';
import type { OnSelectTagProps } from '../../tags/common';

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
  onDiscard: ({ activeView }?: { activeView?: string }) => Promise<boolean>;
  isDirty: boolean;
  onBackToFeed: ({ action }: { action: 'discard' | 'save' }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editFeedSettings: <T extends (...args: any) => any>(
    callback?: T,
  ) => ReturnType<T>;
  isNewFeed: boolean;
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
