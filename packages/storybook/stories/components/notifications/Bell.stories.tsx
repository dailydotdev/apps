import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import NotificationsBell from '@dailydotdev/shared/src/components/notifications/NotificationsBell';
import { NotificationsContextProvider } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import { getUnreadText } from '@dailydotdev/shared/src/components/notifications/utils';
import ExtensionProviders from '../../extension/_providers';

// The notifications bell + its unread "Bubble" badge, across the surfaces it
// renders on: the header button (laptop Float / mobile Option) and the v2
// sidebar rail (vertical icon + "Alerts" label). The badge caps at "20+".
//
// `NotificationsContextProvider` is nested here to drive `unreadCount` — it sits
// closer to the bell than the boot-data provider, so it wins.

const meta: Meta<typeof NotificationsBell> = {
  title: 'Components/Notifications/Bell & badge',
  component: NotificationsBell,
  parameters: {
    docs: {
      description: {
        component:
          'Header/rail bell button and the unread count Bubble. Readability levers: badge contrast against the bell, the 20+ cap, badge offset/size, and the rail label.',
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

type Story = StoryObj<typeof NotificationsBell>;

const Cell = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col items-center gap-3">
    <div className="flex h-16 items-center justify-center">{children}</div>
    <span className="text-text-tertiary typo-footnote">{label}</span>
  </div>
);

const WithCount = ({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) => (
  <NotificationsContextProvider unreadCount={count} isNotificationsReady>
    {children}
  </NotificationsContextProvider>
);

export const HeaderButton: Story = {
  name: 'Header button — unread counts',
  render: () => (
    <div className="flex flex-row flex-wrap items-start gap-10 p-8">
      <Cell label="0 (no badge)">
        <WithCount count={0}>
          <NotificationsBell />
        </WithCount>
      </Cell>
      <Cell label="1">
        <WithCount count={1}>
          <NotificationsBell />
        </WithCount>
      </Cell>
      <Cell label="9">
        <WithCount count={9}>
          <NotificationsBell />
        </WithCount>
      </Cell>
      <Cell label="20+ (capped)">
        <WithCount count={142}>
          <NotificationsBell />
        </WithCount>
      </Cell>
      <Cell label="compact badge">
        <WithCount count={142}>
          <NotificationsBell compact />
        </WithCount>
      </Cell>
    </div>
  ),
};

export const RailVariant: Story = {
  name: 'Sidebar rail — icon + label',
  render: () => (
    <div className="flex flex-row flex-wrap items-start gap-10 bg-background-subtle p-8">
      <Cell label="rail, 0">
        <WithCount count={0}>
          <div className="w-16">
            <NotificationsBell rail noTooltip />
          </div>
        </WithCount>
      </Cell>
      <Cell label="rail, 5">
        <WithCount count={5}>
          <div className="w-16">
            <NotificationsBell rail noTooltip />
          </div>
        </WithCount>
      </Cell>
      <Cell label="rail, 20+">
        <WithCount count={88}>
          <div className="w-16">
            <NotificationsBell rail noTooltip />
          </div>
        </WithCount>
      </Cell>
      <Cell label="rail, label hidden">
        <WithCount count={88}>
          <div className="w-16">
            <NotificationsBell rail noTooltip railHideLabel />
          </div>
        </WithCount>
      </Cell>
    </div>
  ),
};

// The raw badge primitive, isolated so its contrast/size can be tuned directly.
export const CountBubble: Story = {
  name: 'Count bubble (raw)',
  render: () => (
    <div className="flex flex-row flex-wrap items-start gap-10 p-8">
      {[1, 5, 9, 20, 21, 142].map((n) => (
        <Cell key={n} label={`unread = ${n}`}>
          <span className="relative inline-flex size-10 items-center justify-center rounded-12 bg-surface-float">
            <Bubble className="-right-1.5 -top-1.5 px-1">
              {getUnreadText(n)}
            </Bubble>
          </span>
        </Cell>
      ))}
    </div>
  ),
};
