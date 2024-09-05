import React, { ReactElement, useMemo } from 'react';

import { ActionType } from '../../graphql/actions';
import { useActions } from '../../hooks';
import { webappUrl } from '../../lib/constants';
import { checkIsExtension } from '../../lib/func';
import { OtherFeedPage } from '../../lib/query';
import {
  DiscussIcon,
  EarthIcon,
  HashtagIcon,
  HotIcon,
  SquadIcon,
} from '../icons';
import { SharedFeedPage } from '../utilities';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';

interface DiscoverSectionProps extends SectionCommonProps {
  isItemsButton?: boolean;
  enableSearch?: () => void;
  onNavTabClick?: (page: string) => unknown;
}

const locationPush = (path: string) => () =>
  window.location.assign(`${webappUrl}${path}`);

export function DiscoverSection({
  isItemsButton,
  onNavTabClick,
  enableSearch,
  ...defaultRenderSectionProps
}: DiscoverSectionProps): ReactElement {
  const { completeAction } = useActions();

  const discoverMenuItems: SidebarMenuItem[] = useMemo(() => {
    const pushToDiscussed = locationPush(SharedFeedPage.Discussed);
    const isExtension = checkIsExtension();
    const feeds = {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <HotIcon secondary={active} />} />
      ),
      title: 'Explore',
      path: '/posts',
      action: () => onNavTabClick?.(OtherFeedPage.Explore),
    };

    const discussion = {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <DiscussIcon secondary={active} />} />
      ),
      title: 'Discussions',
      path: '/discussed',
      action: () => {
        completeAction(ActionType.CommentFeed);
        if (isExtension) {
          pushToDiscussed();
        }
      },
    };

    return [
      feeds,
      discussion,
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HashtagIcon secondary={active} />} />
        ),
        title: 'Tags',
        path: '/tags',
        action: isExtension ? locationPush('/tags') : undefined,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EarthIcon secondary={active} />} />
        ),
        title: 'Sources',
        path: '/sources',
        action: isExtension ? locationPush('/sources') : undefined,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SquadIcon secondary={active} />} />
        ),
        title: 'Leaderboard',
        path: '/users',
        action: isExtension ? locationPush('/users') : undefined,
      },
    ];
  }, [completeAction, onNavTabClick]);

  return (
    <Section
      {...defaultRenderSectionProps}
      title="Discover"
      items={discoverMenuItems}
      isItemsButton={isItemsButton}
    />
  );
}
