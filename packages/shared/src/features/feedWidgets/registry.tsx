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
import type { FeedWidget } from './types';
import { FeedWidgetKind, FeedWidgetSize } from './types';

export type FeedWidgetComponentProps<
  K extends FeedWidgetKind = FeedWidgetKind,
> = {
  widget: FeedWidget<K>;
  /** The size being rendered; a phone clamps Large to Tall. */
  size: FeedWidgetSize;
  isEditing: boolean;
};

export type FeedWidgetAvailability = {
  isLoggedIn: boolean;
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
  /** More than one may sit on the rail, each with its own config. */
  allowMultiple?: boolean;
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
    isAvailable: needsAccount,
    allowMultiple: true,
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
