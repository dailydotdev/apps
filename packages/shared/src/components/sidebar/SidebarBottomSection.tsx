import React, { ReactElement } from 'react';
import DocsIcon from '../icons/Docs';
import FeedbackIcon from '../icons/Feedback';
import TerminalIcon from '../icons/Terminal';
import SidebarRankProgress from '../SidebarRankProgress';
import { ListIcon, Nav, SidebarMenuItem } from './common';
import InvitePeople from './InvitePeople';
import { Section, SectionCommonProps } from './Section';
import { docs, feedback } from '../../lib/constants';

interface SidebarBottomSectionProps extends SectionCommonProps {
  optOutWeeklyGoal: boolean;
  showSettings: boolean;
}

export function SidebarBottomSectionSection({
  sidebarExpanded,
  sidebarRendered,
  optOutWeeklyGoal,
  showSettings,
  activePage,
}: SidebarBottomSectionProps): ReactElement {
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
      <Section
        activePage={activePage}
        sidebarExpanded={sidebarExpanded}
        sidebarRendered={sidebarRendered}
        items={bottomMenuItems}
        isItemsButton={false}
      />
      <InvitePeople
        sidebarExpanded={sidebarExpanded || sidebarRendered === false}
      />
      {sidebarRendered && !optOutWeeklyGoal && (
        <SidebarRankProgress
          disableNewRankPopup={showSettings}
          sidebarExpanded={sidebarExpanded}
        />
      )}
    </Nav>
  );
}
