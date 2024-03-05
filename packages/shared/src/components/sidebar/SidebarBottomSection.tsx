import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { DocsIcon, FeedbackIcon, TerminalIcon } from '../icons';
import SidebarRankProgress from '../SidebarRankProgress';
import { ListIcon, Nav, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import { docs, feedback } from '../../lib/constants';
import { useChangelog } from '../../hooks/useChangelog';
import { AlertColor, AlertDot } from '../AlertDot';
import { useStreakExperiment } from '../../hooks/streaks';

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

export function SidebarBottomSection({
  optOutWeeklyGoal,
  showSettings,
  ...props
}: SidebarBottomSectionProps): ReactElement {
  const changelog = useChangelog();
  const { shouldShowStreak } = useStreakExperiment();

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
      rightIcon: () =>
        changelog.isAvailable && (
          <AlertDot className="-top-1 right-0" color={AlertColor.Cabbage} />
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
      {!shouldShowStreak && props.sidebarExpanded && !optOutWeeklyGoal && (
        <SidebarRankProgress {...props} disableNewRankPopup={showSettings} />
      )}
      {changelog.isAvailable && <ChangelogTooltip />}
    </Nav>
  );
}
