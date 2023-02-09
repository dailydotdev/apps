import React, { ReactElement } from 'react';
import { useQuery } from 'react-query';
import dynamic from 'next/dynamic';
import DocsIcon from '../icons/Docs';
import FeedbackIcon from '../icons/Feedback';
import TerminalIcon from '../icons/Terminal';
import SidebarRankProgress from '../SidebarRankProgress';
import { ListIcon, Nav, SidebarMenuItem } from './common';
import InvitePeople from './InvitePeople';
import { Section, SectionCommonProps } from './Section';
import { docs, feedback } from '../../lib/constants';

const ChangelogModal = dynamic(
  () =>
    import(/* webpackChunkName: "changelogModal" */ '../modals/ChangelogModal'),
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
  const { data } = useQuery(['changelog'], () => ({
    lastChangelog: Date.now(),
    changelogVersion: '3.66.2',
  }));

  // TODO WT-1054-changelog check this against last changelog user has seen
  const isChangelogModalActive = data?.lastChangelog < Date.now();

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
      badge: {
        active: isChangelogModalActive,
      },
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
      <ChangelogModal isOpen={isChangelogModalActive} />
    </Nav>
  );
}
