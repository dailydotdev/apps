import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../components/Icon';
import { HotIcon } from '../../components/icons/Hot';
import { EarthIcon } from '../../components/icons/Earth';
import { BriefGradientIcon } from '../../components/icons/BriefGradient';
import { BellIcon } from '../../components/icons/Bell';
import { MailIcon } from '../../components/icons/Mail';
import { DiscussIcon } from '../../components/icons/Discuss';
import { SquadIcon } from '../../components/icons/Squad';
import { BookmarkIcon } from '../../components/icons/Bookmark';
import { HashtagIcon } from '../../components/icons/Hashtag';
import { ReadingStreakIcon } from '../../components/icons/ReadingStreak';
import { SunIcon } from '../../components/icons/Sun';
import { ChecklistAIcon } from '../../components/icons/ChecklistA';
import { ShortcutsIcon } from '../../components/icons/Shortcuts';
import { FlagIcon } from '../../components/icons/Flag';
import {
  settingsUrl,
  squadCategoriesPaths,
  webappUrl,
} from '../../lib/constants';
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
  /** Direct messages are on for this reader and this build has chat. */
  hasMessages: boolean;
  /** Live chat rooms are on for this reader. */
  hasLiveChat: boolean;
};

/** The gallery's sections, in the order it lists them. */
export enum FeedWidgetCategory {
  News = 'News',
  You = 'You',
  Community = 'Community',
  Tools = 'Tools',
  DailyDev = 'daily.dev',
}

/** The accent a kind's icon is drawn in: a `--theme-accent-*` name. */
export type FeedWidgetTone =
  | 'avocado'
  | 'bacon'
  | 'bun'
  | 'cabbage'
  | 'cheese'
  | 'onion'
  | 'water';

export type FeedWidgetDefinition<K extends FeedWidgetKind = FeedWidgetKind> = {
  kind: K;
  name: string;
  description: string;
  icon: ComponentType<IconProps>;
  category: FeedWidgetCategory;
  tone: FeedWidgetTone;
  /** Supported sizes, the first being the one a new widget starts at. */
  sizes: FeedWidgetSize[];
  /**
   * The widget is itself a card with its own frame (a post card, the ad), so
   * the rail draws no surface around it.
   */
  isBare?: boolean | ((size: FeedWidgetSize) => boolean);
  isAvailable?: (context: FeedWidgetAvailability) => boolean;
  /**
   * Why an available kind cannot be added right now, shown in the gallery in
   * place of its Add button; undefined when it can.
   */
  disabledReason?: (context: FeedWidgetAvailability) => string | undefined;
  /** Where the reader goes to lift `disabledReason`. */
  disabledFix?: { label: string; href: string };
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
    category: FeedWidgetCategory.News,
    tone: 'cabbage',
    sizes: [FeedWidgetSize.Large, FeedWidgetSize.Tall, FeedWidgetSize.Small],
    isBare: true,
  },
  [FeedWidgetKind.HappeningNow]: {
    kind: FeedWidgetKind.HappeningNow,
    name: 'Happening Now',
    description: 'The major headlines, as the feed card shows them.',
    icon: EarthIcon,
    category: FeedWidgetCategory.News,
    tone: 'avocado',
    sizes: [FeedWidgetSize.Tall, FeedWidgetSize.Small, FeedWidgetSize.Large],
  },
  [FeedWidgetKind.Briefing]: {
    kind: FeedWidgetKind.Briefing,
    name: 'Briefing',
    description: 'Your presidential briefing, ready each morning.',
    icon: BriefGradientIcon,
    category: FeedWidgetCategory.DailyDev,
    tone: 'onion',
    sizes: [FeedWidgetSize.Tall, FeedWidgetSize.Small, FeedWidgetSize.Large],
    // The feed's brief card is the whole tile from Tall up.
    isBare: (size) => size !== FeedWidgetSize.Small,
    isAvailable: needsAccount,
  },
  [FeedWidgetKind.Notifications]: {
    kind: FeedWidgetKind.Notifications,
    name: 'Notifications',
    description: 'Replies, upvotes and mentions, without opening the bell.',
    icon: BellIcon,
    category: FeedWidgetCategory.You,
    tone: 'bacon',
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall, FeedWidgetSize.Large],
    isAvailable: needsAccount,
  },
  [FeedWidgetKind.Messages]: {
    kind: FeedWidgetKind.Messages,
    name: 'Messages',
    description: 'Direct messages, with the unread count up front.',
    icon: MailIcon,
    category: FeedWidgetCategory.Community,
    tone: 'cheese',
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall, FeedWidgetSize.Large],
    isAvailable: ({ isLoggedIn, hasMessages }) => isLoggedIn && hasMessages,
  },
  [FeedWidgetKind.LiveChat]: {
    kind: FeedWidgetKind.LiveChat,
    name: 'Live chat',
    description: 'The live chats happening on trending posts right now.',
    icon: DiscussIcon,
    category: FeedWidgetCategory.Community,
    tone: 'bun',
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall],
    isAvailable: ({ isLoggedIn, hasLiveChat }) => isLoggedIn && hasLiveChat,
  },
  [FeedWidgetKind.SquadUpdates]: {
    kind: FeedWidgetKind.SquadUpdates,
    name: 'Squad updates',
    description: 'New posts in a squad you pick.',
    icon: SquadIcon,
    category: FeedWidgetCategory.Community,
    tone: 'avocado',
    sizes: [FeedWidgetSize.Tall, FeedWidgetSize.Small, FeedWidgetSize.Large],
    isAvailable: needsAccount,
    disabledReason: ({ hasSquads }) =>
      hasSquads
        ? undefined
        : 'Join a squad first, then follow its new posts here.',
    disabledFix: {
      label: 'Find a squad',
      href: `${webappUrl}${squadCategoriesPaths.discover.substring(1)}`,
    },
    allowMultiple: true,
    configureLabel: 'Change squad',
  },
  [FeedWidgetKind.ReadingList]: {
    kind: FeedWidgetKind.ReadingList,
    name: 'Bookmarks',
    description: 'The posts you saved, newest first.',
    icon: BookmarkIcon,
    category: FeedWidgetCategory.You,
    tone: 'bun',
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall, FeedWidgetSize.Large],
    isAvailable: needsAccount,
  },
  [FeedWidgetKind.TopicalDigest]: {
    kind: FeedWidgetKind.TopicalDigest,
    name: 'Topical digest',
    description: 'The latest digest from every topic you subscribed to.',
    icon: HashtagIcon,
    category: FeedWidgetCategory.News,
    tone: 'water',
    sizes: [FeedWidgetSize.Tall, FeedWidgetSize.Large],
    isAvailable: needsAccount,
  },
  [FeedWidgetKind.Streak]: {
    kind: FeedWidgetKind.Streak,
    name: 'Streak',
    description: 'Your reading streak and today’s goal.',
    icon: ReadingStreakIcon,
    category: FeedWidgetCategory.You,
    tone: 'bacon',
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall, FeedWidgetSize.Large],
    isAvailable: needsAccount,
    disabledReason: ({ isReadingStreakOn }) =>
      isReadingStreakOn
        ? undefined
        : 'Reading streaks are off in your settings.',
    disabledFix: {
      label: 'Turn on streaks',
      href: `${settingsUrl}/customization/streaks`,
    },
  },
  [FeedWidgetKind.Weather]: {
    kind: FeedWidgetKind.Weather,
    name: 'Weather',
    description: 'The forecast for your location.',
    icon: SunIcon,
    category: FeedWidgetCategory.Tools,
    tone: 'water',
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall],
  },
  [FeedWidgetKind.TodoList]: {
    kind: FeedWidgetKind.TodoList,
    name: 'To-do list',
    description: 'A short list of things to get to today.',
    icon: ChecklistAIcon,
    category: FeedWidgetCategory.Tools,
    tone: 'cabbage',
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall],
    isAvailable: needsAccount,
  },
  [FeedWidgetKind.Shortcuts]: {
    kind: FeedWidgetKind.Shortcuts,
    name: 'Shortcuts',
    description:
      'The sites you pinned and, in the extension, your most visited ones.',
    icon: ShortcutsIcon,
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall, FeedWidgetSize.Large],
  },
  [FeedWidgetKind.GettingStarted]: {
    kind: FeedWidgetKind.GettingStarted,
    name: 'Getting started',
    description:
      'The intro quests, with their XP and Cores, one step at a time.',
    icon: FlagIcon,
    category: FeedWidgetCategory.DailyDev,
    tone: 'cheese',
    sizes: [FeedWidgetSize.Small, FeedWidgetSize.Tall, FeedWidgetSize.Large],
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
