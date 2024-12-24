import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { DocsIcon, FeedbackIcon, TerminalIcon } from '../../icons';
import { docs, feedback, webappUrl } from '../../../lib/constants';
import { Section } from '../Section';
import { AlertColor, AlertDot } from '../../AlertDot';
import { useChangelog } from '../../../hooks/useChangelog';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import type { SidebarSectionProps } from './common';

export const ResourceSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const changelog = useChangelog();
  const menuItems: SidebarMenuItem[] = useMemo(() => {
    return [
      {
        icon: () => <ListIcon Icon={() => <DocsIcon />} />,
        title: 'Docs',
        path: docs,
        target: '_blank',
      },
      {
        icon: () => <ListIcon Icon={() => <TerminalIcon />} />,
        title: 'Changelog',
        path: `${webappUrl}sources/daily_updates`,
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
    ].filter(Boolean);
  }, [changelog.isAvailable]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.ResourcesExpanded}
    />
  );
};
