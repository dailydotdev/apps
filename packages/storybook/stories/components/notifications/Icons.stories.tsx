import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import NotificationIcon from '@dailydotdev/shared/src/components/notifications/NotificationIcon';
import {
  NotificationFilterCategory,
  notificationCategoryBadge,
  notificationFilterCategoryLabel,
  NotificationIconType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import ExtensionProviders from '../../extension/_providers';

// The two visual vocabularies a notification row leans on:
//  1. The lead type-icon (NotificationIcon) — what shows when there is no actor
//     avatar (system / digest / streak rows).
//  2. The category badge — the colored corner glyph overlaid on an avatar that
//     signals upvote / comment / mention / follow / squad at a glance.

const meta: Meta = {
  title: 'Components/Notifications/Icons & badges',
  parameters: {
    docs: {
      description: {
        component:
          'Every notification lead icon and every category badge in one place — the building blocks for a row\'s type-at-a-glance cue. Tune glyph contrast, background, and color tokens here.',
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

const Tile = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex w-28 flex-col items-center gap-2 rounded-12 border border-border-subtlest-tertiary p-3">
    <div className="flex h-10 items-center justify-center">{children}</div>
    <span className="text-center text-text-tertiary typo-caption1">
      {label}
    </span>
  </div>
);

export const LeadIcons: Story = {
  name: 'Lead type icons',
  render: () => (
    <div className="flex flex-row flex-wrap gap-3 p-6">
      {Object.values(NotificationIconType).map((icon) => (
        <Tile key={icon} label={icon}>
          <NotificationIcon icon={icon} />
        </Tile>
      ))}
    </div>
  ),
};

export const CategoryBadges: Story = {
  name: 'Category badges',
  render: () => (
    <div className="flex flex-row flex-wrap gap-3 p-6">
      {Object.values(NotificationFilterCategory).map((category) => {
        const badge = notificationCategoryBadge[category];
        const BadgeIcon = badge.Icon;
        return (
          <Tile key={category} label={notificationFilterCategoryLabel[category]}>
            <span
              className={`flex size-5 items-center justify-center rounded-full ${badge.bg}`}
            >
              <BadgeIcon
                secondary
                size={IconSize.XXSmall}
                className={badge.fg}
              />
            </span>
          </Tile>
        );
      })}
    </div>
  ),
};

// How the badge actually sits on an avatar in the feed (corner overlay).
export const BadgeOnAvatar: Story = {
  name: 'Badge over avatar',
  render: () => (
    <div className="flex flex-row flex-wrap gap-6 p-6">
      {Object.values(NotificationFilterCategory)
        .filter((c) => c !== NotificationFilterCategory.Updates)
        .map((category) => {
          const badge = notificationCategoryBadge[category];
          const BadgeIcon = badge.Icon;
          return (
            <div key={category} className="flex flex-col items-center gap-2">
              <div className="relative flex items-center">
                <span className="size-10 rounded-full bg-surface-float" />
                <span
                  className={`absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-background-default ${badge.bg}`}
                >
                  <BadgeIcon
                    secondary
                    size={IconSize.XXSmall}
                    className={badge.fg}
                  />
                </span>
              </div>
              <span className="text-text-tertiary typo-caption1">
                {notificationFilterCategoryLabel[category]}
              </span>
            </div>
          );
        })}
    </div>
  ),
};
