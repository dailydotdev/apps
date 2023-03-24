import React, { ReactElement, useContext, useRef } from 'react';
import dynamic from 'next/dynamic';
import DocsIcon from '../icons/Docs';
import FeedbackIcon from '../icons/Feedback';
import TerminalIcon from '../icons/Terminal';
import SidebarRankProgress from '../SidebarRankProgress';
import { ListIcon, Nav, SidebarMenuItem } from './common';
import InvitePeople from './InvitePeople';
import { Section, SectionCommonProps } from './Section';
import { careers, docs, feedback } from '../../lib/constants';
import { useChangelog } from '../../hooks/useChangelog';
import MegaphoneIcon from '../icons/Megaphone';
import FeaturesContext from '../../contexts/FeaturesContext';

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
  const { showHiring } = useContext(FeaturesContext);
  const changelog = useChangelog();
  const navItemRef = useRef<HTMLElement>();

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
      navItemRef,
    },
    {
      icon: () => <ListIcon Icon={() => <FeedbackIcon />} />,
      title: 'Feedback',
      path: feedback,
      target: '_blank',
    },
  ];

  if (showHiring) {
    bottomMenuItems.unshift({
      icon: () => <ListIcon Icon={() => <MegaphoneIcon />} />,
      title: 'We are hiring',
      path: careers,
      target: '_blank',
    });
  }

  return (
    <Nav>
      <Section {...props} items={bottomMenuItems} isItemsButton={false} />
      <InvitePeople {...props} />
      {props.sidebarExpanded && !optOutWeeklyGoal && (
        <SidebarRankProgress {...props} disableNewRankPopup={showSettings} />
      )}
      {changelog.isAvailable && (
        <ChangelogTooltip
          elementRef={navItemRef}
          appendTo={() => navItemRef.current}
        />
      )}
    </Nav>
  );
}
