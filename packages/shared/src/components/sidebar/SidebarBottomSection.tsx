import React, { ReactElement, useContext, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from 'react-query';
import DocsIcon from '../icons/Docs';
import FeedbackIcon from '../icons/Feedback';
import TerminalIcon from '../icons/Terminal';
import SidebarRankProgress from '../SidebarRankProgress';
import { ListIcon, Nav, SidebarMenuItem } from './common';
import InvitePeople from './InvitePeople';
import { Section, SectionCommonProps } from './Section';
import { docs, feedback } from '../../lib/constants';
import { AlertColor, AlertDot } from '../AlertDot';
import AlertContext from '../../contexts/AlertContext';
import { getLatestChangelogPost } from '../../graphql/posts';
import AuthContext from '../../contexts/AuthContext';

const ChangelogTooltip = dynamic(
  () =>
    import(
      /* webpackChunkName: "changelogTooltip" */ '../tooltips/ChangelogTooltip'
    ),
);

interface SidebarBottomSectionProps extends SectionCommonProps {
  optOutWeeklyGoal: boolean;
  showSettings: boolean;
}

export function SidebarBottomSectionSection({
  optOutWeeklyGoal,
  showSettings,
  ...props
}: SidebarBottomSectionProps): ReactElement {
  const { alerts } = useContext(AlertContext);
  const { user } = useContext(AuthContext);

  const { data: lastestChangelogPost } = useQuery(
    ['changelog', 'latest-post', { loggedIn: !!user?.id }] as const,
    async ({ queryKey }) => {
      const [, , variables] = queryKey;

      return getLatestChangelogPost(variables.loggedIn);
    },
  );
  const isChangelogVisible = useMemo(() => {
    const lastChangelogDate = Date.parse(alerts?.lastChangelog);
    const lastPostDate = Date.parse(lastestChangelogPost?.createdAt);

    if (Number.isNaN(lastChangelogDate) || Number.isNaN(lastPostDate)) {
      return false;
    }

    return lastPostDate > lastChangelogDate;
  }, [alerts.lastChangelog, lastestChangelogPost?.createdAt]);
  const changelogBadgeRef = useRef<HTMLElement>();

  const bottomMenuItems: SidebarMenuItem[] = [
    {
      icon: () => <ListIcon Icon={() => <DocsIcon />} />,
      title: 'Docs',
      path: docs,
      target: '_blank',
    },
    {
      icon: () => <ListIcon Icon={() => <TerminalIcon />} />,
      title: 'Changelog',
      path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}sources/daily_updates`,
      badge: isChangelogVisible && (
        <AlertDot
          className="right-2"
          ref={changelogBadgeRef}
          color={AlertColor.Cabbage}
        />
      ),
    },
    {
      icon: () => <ListIcon Icon={() => <FeedbackIcon />} />,
      title: 'Feedback',
      path: feedback,
      target: '_blank',
    },
  ];

  return (
    <Nav>
      <Section {...props} items={bottomMenuItems} isItemsButton={false} />
      <InvitePeople {...props} />
      {props.sidebarExpanded && !optOutWeeklyGoal && (
        <SidebarRankProgress {...props} disableNewRankPopup={showSettings} />
      )}
      {isChangelogVisible && (
        <ChangelogTooltip elementRef={changelogBadgeRef} />
      )}
    </Nav>
  );
}
