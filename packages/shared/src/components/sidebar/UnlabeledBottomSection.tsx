import React, { ReactElement } from 'react';
import DocsIcon from '../icons/Docs';
import FeedbackIcon from '../icons/Feedback';
import TerminalIcon from '../icons/Terminal';
import SidebarRankProgress from '../SidebarRankProgress';
import { ListIcon, Nav, SectionProps, SidebarMenuItem } from './common';
import InvitePeople from './InvitePeople';
import { Section } from './Section';

interface UnlabeledBottomSectionProps extends SectionProps {
  optOutWeeklyGoal: boolean;
  showSettings: boolean;
}

export function UnlabeledBottomSection({
  sidebarExpanded,
  sidebarRendered,
  optOutWeeklyGoal,
  showSettings,
  activePage,
}: UnlabeledBottomSectionProps): ReactElement {
  const bottomMenuItems: SidebarMenuItem[] = [
    {
      icon: () => <ListIcon Icon={() => <DocsIcon />} />,
      title: 'Docs',
      path: 'https://docs.daily.dev/',
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
      path: 'https://daily.dev/feedback',
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
