import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { Section } from '../Section';
import type { SidebarSectionProps } from './common';
import { SignalIcon } from '../../icons/Signal';
import { PlusIcon } from '../../icons/Plus';
import { MailIcon } from '../../icons/Mail';
import { VolunteeringIcon } from '../../icons/Volunteering';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Origin } from '../../../lib/log';
import { myLfgPostQueryOptions } from '../../../features/lfg/queries';
import {
  getLfgReachOutUrl,
  getLfgUrl,
  lfgNewPostUrl,
} from '../../../features/lfg/lib/format';
import { useLfgEnabled } from '../../../features/lfg/hooks/useLfgEnabled';
import { useLfgModals } from '../../../features/lfg/hooks/useLfgModals';

// The Looking for group tab's panel: the board, the reader's own post (or a
// way to write one), the responses waiting on it and Open to helping.
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
  const items: SidebarMenuItem[] = useMemo(
    () =>
      [
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
            }
          : {
              icon: () => <ListIcon Icon={() => <PlusIcon />} />,
              title: 'New post',
              path: lfgNewPostUrl,
              isForcedLink: true,
            },
        !!myPost && {
          icon: (active: boolean) => (
            <ListIcon Icon={() => <MailIcon secondary={active} />} />
          ),
          title: myPost.pendingCount
            ? `Responses (${myPost.pendingCount})`
            : 'Responses',
          path: getLfgReachOutUrl(),
          isForcedLink: true,
        },
        {
          icon: () => <ListIcon Icon={() => <VolunteeringIcon />} />,
          title: 'Open to helping',
          action: () => openHelper(Origin.Sidebar),
        },
      ].filter(Boolean) as SidebarMenuItem[],
    [myPost, openHelper],
  );

  return (
    <Section
      {...defaultRenderSectionProps}
      items={items}
      isItemsButton={isItemsButton}
    />
  );
};
