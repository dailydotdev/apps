import React, { ReactElement, useContext, useRef } from 'react';
import dynamic from 'next/dynamic';
import DocsIcon from '../icons/Docs';
import FeedbackIcon from '../icons/Feedback';
import TerminalIcon from '../icons/Terminal';
import SidebarRankProgress from '../SidebarRankProgress';
import { ListIcon, Nav, SidebarMenuItem } from './common';
import InvitePeople from './InvitePeople';
import { Section, SectionCommonProps } from './Section';
import { docs, feedback } from '../../lib/constants';
import { AlertColor, AlertDot, AlertDotSize } from '../AlertDot';
import { useChangelog } from '../../hooks/useChangelog';
import SettingsContext from '../../contexts/SettingsContext';

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
  const changelog = useChangelog();
  const changelogBadgeRef = useRef<HTMLElement>();
  const navItemRef = useRef<HTMLElement>();
  const { sidebarExpanded } = useContext(SettingsContext);

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
      rightIcon: changelog.isAvailable
        ? () => (
            <div className="h-2" data-testid="changelogBadge">
              <AlertDot
                className={sidebarExpanded ? 'right-2' : 'right-1'}
                ref={changelogBadgeRef}
                color={AlertColor.Cabbage}
                size={AlertDotSize.XSmall}
              />
            </div>
          )
        : undefined,
      navItemRef,
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
      {changelog.isAvailable && (
        <ChangelogTooltip
          elementRef={changelogBadgeRef}
          appendTo={() => navItemRef.current}
        />
      )}
    </Nav>
  );
}
