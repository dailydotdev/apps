import type { ReactElement } from 'react';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import type { IconProps } from '../../Icon';
import { AddUserIcon } from '../../icons/AddUser';
import { EditIcon } from '../../icons/Edit';
import { FilterIcon } from '../../icons/Filter';
import { HashtagIcon } from '../../icons/Hashtag';
import { HomeIcon } from '../../icons/Home';
import { MagicIcon } from '../../icons/Magic';
import { SortIcon } from '../../icons/Sort';
import { useModalContext } from '../../modals/common/types';
import { settingsUrl } from '../../../lib/constants';
import { useForYouControls } from '../../../features/feedExplain/useFeedExplainMode';
import { FeedSettingsMenu } from './types';

export type ForYouSettingsPageId =
  | FeedSettingsMenu.Overview
  | FeedSettingsMenu.Tags
  | FeedSettingsMenu.ContentSources
  | FeedSettingsMenu.Ranking
  | FeedSettingsMenu.Filters
  | FeedSettingsMenu.AI
  | FeedSettingsMenu.General;

export interface ForYouSettingsPage {
  id: ForYouSettingsPageId;
  title: string;
  icon: (props: IconProps) => ReactElement;
}

export const forYouSettingsTitle: Record<ForYouSettingsPageId, string> = {
  [FeedSettingsMenu.Overview]: 'Overview',
  [FeedSettingsMenu.Tags]: 'Topics',
  [FeedSettingsMenu.ContentSources]: 'Sources and creators',
  [FeedSettingsMenu.Ranking]: 'Ranking',
  [FeedSettingsMenu.Filters]: 'Filters',
  [FeedSettingsMenu.AI]: 'AI superpowers',
  [FeedSettingsMenu.General]: 'General',
};

const pageIcons: Record<ForYouSettingsPageId, ForYouSettingsPage['icon']> = {
  [FeedSettingsMenu.Overview]: HomeIcon,
  [FeedSettingsMenu.Tags]: HashtagIcon,
  [FeedSettingsMenu.ContentSources]: AddUserIcon,
  [FeedSettingsMenu.Ranking]: SortIcon,
  [FeedSettingsMenu.Filters]: FilterIcon,
  [FeedSettingsMenu.AI]: MagicIcon,
  [FeedSettingsMenu.General]: EditIcon,
};

const pages: ForYouSettingsPage[] = (
  Object.keys(forYouSettingsTitle) as ForYouSettingsPageId[]
).map((id) => ({ id, title: forYouSettingsTitle[id], icon: pageIcons[id] }));

export const getForYouSettingsUrl = (page: ForYouSettingsPageId): string =>
  `${settingsUrl}/feed/${page}`;

/**
 * The page a Feed settings link names. Content preferences and Blocked
 * content are one page now, Filters.
 */
export const getForYouSettingsPage = (
  menu: string | undefined,
): ForYouSettingsPageId | undefined => {
  if (
    menu === FeedSettingsMenu.ContentPreferences ||
    menu === FeedSettingsMenu.Blocking
  ) {
    return FeedSettingsMenu.Filters;
  }
  return pages.find(({ id }) => id === menu)?.id;
};

/**
 * For You's Feed settings pages, in menu order. Ranking holds only the
 * ranking settings, so it shows only where For You ranks with them.
 */
export const useForYouSettingsPages = (): ForYouSettingsPage[] => {
  const { isAvailable } = useForYouControls();

  return useMemo(
    () =>
      isAvailable
        ? pages
        : pages.filter(({ id }) => id !== FeedSettingsMenu.Ranking),
    [isAvailable],
  );
};

/**
 * Opens another Feed settings page: its tab in the feed's edit modal, or its
 * page in Settings.
 */
export const useOpenForYouSettingsPage = (): ((
  page: ForYouSettingsPageId,
) => void) => {
  const router = useRouter();
  const { setActiveView } = useModalContext();

  return useCallback(
    (page: ForYouSettingsPageId) => {
      if (setActiveView) {
        setActiveView(forYouSettingsTitle[page]);
        return;
      }
      router.push(getForYouSettingsUrl(page));
    },
    [router, setActiveView],
  );
};
