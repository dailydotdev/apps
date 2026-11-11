import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { Section } from '../Section';
import { SidebarCountBadge } from '../SidebarCountBadge';
import type { SidebarSectionProps } from './common';
import { SignalIcon } from '../../icons/Signal';
import { PlusIcon } from '../../icons/Plus';
import { VolunteeringIcon } from '../../icons/Volunteering';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Origin } from '../../../lib/log';
import { myLfgPostQueryOptions } from '../../../features/lfg/queries';
import { getLfgUrl, lfgNewPostUrl } from '../../../features/lfg/lib/format';
import { useLfgEnabled } from '../../../features/lfg/hooks/useLfgEnabled';
import { useLfgModals } from '../../../features/lfg/hooks/useLfgModals';

// Looking for group inside the Messages panel. The phone LFG tab in Messages
// lists the same rows.
export const LfgSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { user } = useAuthContext();
  const { isEnabled } = useLfgEnabled();
  const { openHelper } = useLfgModals();
  const { data: myPost } = useQuery(
    myLfgPostQueryOptions(user, { enabled: isEnabled }),
  );
  const items = useMemo(
    (): SidebarMenuItem[] => [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SignalIcon secondary={active} />} />
        ),
        title: 'Board',
        path: getLfgUrl(),
        isForcedLink: true,
      },
      myPost
        ? {
            icon: (active: boolean) => (
              <ListIcon Icon={() => <SignalIcon secondary={active} />} />
            ),
            title: 'Your post',
            path: getLfgUrl(myPost.id),
            isForcedLink: true,
            rightIcon: myPost.pendingCount
              ? () => <SidebarCountBadge count={myPost.pendingCount ?? 0} />
              : undefined,
          }
        : {
            icon: () => <ListIcon Icon={() => <PlusIcon />} />,
            title: 'New post',
            path: lfgNewPostUrl,
            isForcedLink: true,
          },
      {
        icon: () => <ListIcon Icon={() => <VolunteeringIcon />} />,
        title: 'Open to helping',
        action: () => openHelper(Origin.Sidebar),
      },
    ],
    [myPost, openHelper],
  );

  return (
    <Section
      {...defaultRenderSectionProps}
      title="Looking for group"
      items={items}
      isItemsButton={isItemsButton}
    />
  );
};
