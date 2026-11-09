import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { subDays } from 'date-fns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { dateFormatInTimezone } from '@dailydotdev/shared/src/lib/timezones';
import { GtaViCalendar, GtaViPopup, GtaViWidget } from './gtaVi';

const mockUser = { id: 'gta-vi-streak-user', timezone: 'Europe/Helsinki' };

/** Days ago the user read, matching the mock: three flames before today. */
const READ_OFFSETS = [4, 1, 0];

const StreakData = ({ children }: { children: ReactNode }): ReactElement => {
  const [client] = useState(() => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
    queryClient.setQueryData(
      generateQueryKey(RequestKey.ReadingStreak30Days, mockUser),
      READ_OFFSETS.map((offset) => ({
        date: subDays(new Date(), offset).toISOString(),
        reads: 1,
      })),
    );
    return queryClient;
  });

  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{ user: mockUser } as unknown as AuthContextData}
      >
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

/** The top of the sidebar "Current Streak" panel, down to the calendar. */
const StreakPanel = ({ width = 'w-80' }: { width?: string }): ReactElement => (
  <StreakData>
    <div className={`flex flex-col gap-4 bg-background-default p-4 ${width}`}>
      <span className="font-bold typo-title3">Current Streak</span>
      <div className="flex flex-col gap-1">
        <span className="font-bold typo-large-title">2</span>
        <span className="text-text-tertiary typo-callout">
          31 Longest · 759 Total
        </span>
      </div>
      <div className="flex items-center justify-between typo-callout">
        <span className="font-bold">
          Today, {dateFormatInTimezone(new Date(), 'MMM d', mockUser.timezone)}
        </span>
        <span className="text-text-tertiary">{mockUser.timezone}</span>
      </div>
      <div className="pb-24">
        <GtaViCalendar />
      </div>
    </div>
  </StreakData>
);

const meta: Meta = {
  title: 'Streak/GTA VI day',
  parameters: { layout: 'centered' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

const openTooltip: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(
    await canvas.findByRole('button', { name: 'GTA VI release day' }),
  );
  await expect(
    await within(document.body).findByRole('tooltip'),
  ).toBeInTheDocument();
};

/** Sidebar panel: release day marked with the VI disc; hover it. */
export const Default: Story = {
  render: () => <StreakPanel />,
};

/** The tooltip as it opens on hover (laptop) or tap (phone and tablet). */
export const TooltipOpen: Story = {
  render: () => <StreakPanel />,
  play: openTooltip,
};

/** Phone width: the VI disc is a button, so a tap opens the tooltip. */
export const Phone: Story = {
  render: () => <StreakPanel width="w-[23.4375rem]" />,
  play: openTooltip,
};

/** Feed widget: the same calendar under the count. */
export const Widget: Story = {
  render: () => (
    <StreakData>
      <div className="pb-24">
        <GtaViWidget />
      </div>
    </StreakData>
  ),
  play: openTooltip,
};

/** The streak button popup's week strip on release day. */
export const PopupWeekStrip: Story = {
  render: () => (
    <StreakData>
      <div className="pb-28">
        <GtaViPopup />
      </div>
    </StreakData>
  ),
  play: openTooltip,
};
