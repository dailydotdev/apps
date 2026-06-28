import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import {
  getNotificationCategory,
  notificationFilterCategoryLabel,
  notificationFilterCategoryList,
  NotificationFilterCategory,
} from '@dailydotdev/shared/src/components/notifications/utils';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbar';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import ExtensionProviders from '../../extension/_providers';
import { groupByTime, sampleNotifications } from './_mock';

// Faithful, provider-light reconstruction of the /notifications page
// (packages/webapp/components/notifications/NotificationsFeed.tsx) using the
// real shared NotificationItem rows + the same filter bar primitive and time
// grouping. The live page is auth-gated and needs backend data, so this is the
// canvas to iterate on the page's readability.

const meta: Meta = {
  title: 'Components/Notifications/Full page',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Reconstruction of the /notifications page — header, type filters, time-grouped feed of NotificationItem rows. Use the filter tabs to scope by category. The real page lives in NotificationsFeed.tsx and is auth-gated, so this is where to review page-level readability.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const NotificationsPage = (): React.ReactElement => {
  const [active, setActive] = useState<NotificationFilterCategory | null>(null);

  const filtered = useMemo(
    () =>
      active
        ? sampleNotifications.filter(
            (item) => getNotificationCategory(item.type) === active,
          )
        : sampleNotifications,
    [active],
  );

  const groups = useMemo(() => groupByTime(filtered), [filtered]);

  return (
    <div className="mx-auto w-full max-w-[42.5rem] border-x border-border-subtlest-tertiary bg-background-default">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h2 className="font-bold typo-body">Notifications</h2>
        <button
          type="button"
          aria-label="Notification settings"
          className="grid size-8 place-items-center rounded-10 text-text-tertiary hover:bg-surface-hover"
        >
          <SettingsIcon size={IconSize.Small} />
        </button>
      </div>

      <div className="flex min-h-14 items-center border-b border-border-subtlest-quaternary px-4">
        <SquadDirectoryNavbar
          aria-label="Filter notifications by type"
          className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
        >
          <SquadDirectoryNavbarItem
            buttonSize={ButtonSize.Small}
            isActive={active === null}
            label="All activity"
            ariaLabel="Show all notifications"
            onClick={() => setActive(null)}
          />
          {notificationFilterCategoryList.map((category) => (
            <SquadDirectoryNavbarItem
              key={category}
              buttonSize={ButtonSize.Small}
              isActive={active === category}
              label={notificationFilterCategoryLabel[category]}
              ariaLabel={`Show ${notificationFilterCategoryLabel[category]} notifications`}
              onClick={() => setActive(category)}
            />
          ))}
        </SquadDirectoryNavbar>
      </div>

      {groups.map((group) => (
        <section key={group.key}>
          <h3 className="px-4 pb-1 pt-6 font-bold text-text-tertiary typo-footnote first:pt-4">
            {group.label}
          </h3>
          {group.items.map((item) => (
            <NotificationItem key={item.referenceId} {...item} />
          ))}
        </section>
      ))}

      {filtered.length === 0 && active && (
        <p className="px-4 py-10 text-center text-text-tertiary typo-callout">
          No {notificationFilterCategoryLabel[active].toLowerCase()}{' '}
          notifications yet.
        </p>
      )}
    </div>
  );
};

export const Page: Story = {
  name: 'Notifications page',
  render: () => <NotificationsPage />,
};

export const MobileViewport: Story = {
  name: 'Notifications page (mobile)',
  parameters: { viewport: { defaultViewport: 'mobile2' } },
  render: () => <NotificationsPage />,
};
