import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../components/Icon';
import { HotIcon } from '../../components/icons/Hot';
import { EarthIcon } from '../../components/icons/Earth';
import { BriefGradientIcon } from '../../components/icons/BriefGradient';
import { BellIcon } from '../../components/icons/Bell';
import { MailIcon } from '../../components/icons/Mail';
import { SquadIcon } from '../../components/icons/Squad';
import { BookmarkIcon } from '../../components/icons/Bookmark';
import { HashtagIcon } from '../../components/icons/Hashtag';
import { ReadingStreakIcon } from '../../components/icons/ReadingStreak';
import { SunIcon } from '../../components/icons/Sun';
import { ChecklistAIcon } from '../../components/icons/ChecklistA';
import type { FeedWidget, FeedWidgetConfig } from './types';
import { FeedWidgetKind, FeedWidgetSize } from './types';

export type FeedWidgetComponentProps<
  K extends FeedWidgetKind = FeedWidgetKind,
> = {
  widget: FeedWidget<K>;
  /** The size being rendered; a phone clamps Large to Tall. */
  size: FeedWidgetSize;
  isEditing: boolean;
  /**
   * Saves this widget's config; `false` when it is not saved (a read-only
   * rail, a newer build's config, or one that does not validate).
   */
  onConfigChange: (config: FeedWidgetConfig<K>) => boolean;
  /**
   * Whether this build can save the widget's config: not on a read-only rail
   * nor over a newer build's config, so a widget never offers a dead control.
   */
  canConfigure: boolean;
  /** The reader picked the kind's `configureLabel` in the widget's menu. */
  isConfiguring: boolean;
  /** The widget is done configuring, saved or not. */
  onConfigureEnd: () => void;
};

export type FeedWidgetAvailability = {
  isLoggedIn: boolean;
  hasSquads: boolean;
  isReadingStreakOn: boolean;
};

export type FeedWidgetDefinition<K extends FeedWidgetKind = FeedWidgetKind> = {
  kind: K;
  name: string;
  description: string;
  icon: ComponentType<IconProps>;
  /** Supported sizes, the first being the one a new widget starts at. */
  sizes: FeedWidgetSize[];
  /**
   * The widget is itself a card with its own frame (a post card, the ad), so
   * the rail draws no surface around it.
   */
  isBare?: boolean | ((size: FeedWidgetSize) => boolean);
  isAvailable?: (context: FeedWidgetAvailability) => boolean;
  /**
   * Why an available kind cannot be added right now, shown on its disabled
   * gallery row; undefined when it can.
   */
  disabledReason?: (context: FeedWidgetAvailability) => string | undefined;
  /** More than one may sit on the rail, each with its own config. */
  allowMultiple?: boolean;
  /**
   * The widget's menu entry that asks it to change its config, for a kind the
   * reader configures.
   */
  configureLabel?: string;
};

const needsAccount = ({ isLoggedIn }: FeedWidgetAvailability): boolean =>
  isLoggedIn;

const needsSquad = ({
  isLoggedIn,
  hasSquads,
}: FeedWidgetAvailability): boolean => isLoggedIn && hasSquads;

/**
 * Every kind the API knows, built or not. Which ones render comes from
 * `components.ts`, kept apart so a widget can import the frame and the icons
 * here without a cycle.
 */
export const feedWidgetRegistry: {
  [K in FeedWidgetKind]: FeedWidgetDefinition<K>;
} = {
  [FeedWidgetKind.TopStory]: {
    kind: FeedWidgetKind.TopStory,
    name: 'Top story',
    description: 'The headlines of the day, as a carousel of cards.',
    icon: HotIcon,
    sizes: [FeedWidgetSize.Large, FeedWidgetSize.Tall, FeedWidgetSize.Small],
    isBare: true,
  },
  [FeedWidgetKind.HappeningNow]: {
    kind: FeedWidgetKind.HappeningNow,
    name: 'Happening Now',
    description: 'The major headlines, as the feed card shows them.',
    icon: EarthIcon,
    sizes: [FeedWidgetSize.Tall, FeedWidgetSize.Small, FeedWidgetSize.Large],
  },
  [FeedWidgetKind.Briefing]: {
    kind: FeedWidgetKind.Briefing,
    name: 'Briefing',
    description: 'Your presidential briefing, ready each morning.',
    icon: BriefGradientIcon,
    sizes: [FeedWidgetSize.Tall, FeedWidgetSize.Small, FeedWidgetSize.Large],
    isAvailable: needsAccount,
  },
  [FeedWidgetKind.Notifications]: {
    kind: FeedWidgetKind.Notifications,
    name: 'Notifications',
    description: 'Replies, upvotes and mentions, without opening the bell.',
    icon: BellIcon,
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall, FeedWidgetSize.Large],
    isAvailable: needsAccount,
  },
  [FeedWidgetKind.Messages]: {
    kind: FeedWidgetKind.Messages,
    name: 'Messages',
    description: 'Direct messages, with the unread count up front.',
    icon: MailIcon,
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall, FeedWidgetSize.Large],
    isAvailable: needsAccount,
  },
  [FeedWidgetKind.SquadUpdates]: {
    kind: FeedWidgetKind.SquadUpdates,
    name: 'Squad updates',
    description: 'New posts in a squad you pick.',
    icon: SquadIcon,
    sizes: [FeedWidgetSize.Tall, FeedWidgetSize.Small, FeedWidgetSize.Large],
    isAvailable: needsSquad,
    allowMultiple: true,
    configureLabel: 'Change squad',
  },
  [FeedWidgetKind.ReadingList]: {
    kind: FeedWidgetKind.ReadingList,
    name: 'Reading list',
    description: 'Bookmarks waiting for you.',
    icon: BookmarkIcon,
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall, FeedWidgetSize.Large],
    isAvailable: needsAccount,
  },
  [FeedWidgetKind.TopicalDigest]: {
    kind: FeedWidgetKind.TopicalDigest,
    name: 'Topical digest',
    description: 'The latest digest from every topic you subscribed to.',
    icon: HashtagIcon,
    sizes: [FeedWidgetSize.Tall, FeedWidgetSize.Large],
    isAvailable: needsAccount,
  },
  [FeedWidgetKind.Streak]: {
    kind: FeedWidgetKind.Streak,
    name: 'Streak',
    description: 'Your reading streak and today’s goal.',
    icon: ReadingStreakIcon,
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall, FeedWidgetSize.Large],
    isAvailable: needsAccount,
    disabledReason: ({ isReadingStreakOn }) =>
      isReadingStreakOn
        ? undefined
        : 'Turn on "Show reading streaks" in Streaks & gamification settings to add this widget.',
  },
  [FeedWidgetKind.Weather]: {
    kind: FeedWidgetKind.Weather,
    name: 'Weather',
    description: 'The forecast for your location.',
    icon: SunIcon,
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall],
  },
  [FeedWidgetKind.TodoList]: {
    kind: FeedWidgetKind.TodoList,
    name: 'To-do list',
    description: 'A short list of things to get to today.',
    icon: ChecklistAIcon,
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall],
    isAvailable: needsAccount,
  },
};

export const getFeedWidgetDefinition = (
  kind: FeedWidgetKind,
): FeedWidgetDefinition => feedWidgetRegistry[kind] as FeedWidgetDefinition;

export const isFeedWidgetBare = (
  kind: FeedWidgetKind,
  size: FeedWidgetSize,
): boolean => {
  const { isBare } = getFeedWidgetDefinition(kind);
  return typeof isBare === 'function' ? isBare(size) : !!isBare;
};

export const FeedWidgetIcon = ({
  kind,
  ...props
}: IconProps & { kind: FeedWidgetKind }): ReactElement => {
  const { icon: Icon } = getFeedWidgetDefinition(kind);
  return <Icon secondary {...props} />;
};
