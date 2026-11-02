import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { WithClassNameProps } from '../utilities';
import type { PlusItem, PlusListItemProps } from './PlusListItem';
import { PlusItemStatus, PlusListItem } from './PlusListItem';
import { LogEvent, TargetType } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import {
  BlockIcon,
  BriefIcon,
  CoreIcon,
  FolderIcon,
  HashtagIcon,
  LabelIcon,
  LanguageIcon,
  ShieldPlusIcon,
  TourIcon,
} from '../icons';
import {
  plusShowcaseAdFreeImage,
  plusShowcaseBookmarkImage,
  plusShowcaseBookmarkVideo,
  plusShowcaseCustomFeedsImage,
  plusShowcaseCustomFeedsVideo,
  plusShowcaseKeywordImage,
  plusShowcasePresidentialBriefImage,
  plusShowcaseShieldImage,
  plusShowcaseShieldVideo,
  plusShowcaseTranslateImage,
} from '../../lib/image';
import { plusOverviewDocs } from '../../lib/constants';

export const defaultFeatureList: Array<PlusItem> = [
  {
    label: 'Personalized feed',
    status: PlusItemStatus.Ready,
    tooltip: `Your go-to place for dev news, tutorials, and updates. Curated just for you, so you never miss what's new.`,
  },
  {
    label: 'Search',
    status: PlusItemStatus.Ready,
    tooltip: `Find exactly what you're looking for—whether it's answers, trending topics, or the latest tools and resources.`,
  },
  {
    label: 'Squads',
    status: PlusItemStatus.Ready,
    tooltip: `Join groups of developers who share your interests. Exchange ideas, collaborate, and grow together in a focused space.`,
  },
  {
    label: 'Bookmarks',
    status: PlusItemStatus.Ready,
    tooltip: `Save posts you want to revisit later. Short on time? Set reading reminders and never lose track of the good stuff.`,
  },
  {
    label: '100+ more features',
    status: PlusItemStatus.Ready,
    tooltip: `We offer tons of other features for free because we believe high-quality, personalized content should be open for everyone.`,
  },
];

export const plusFeatureList: Array<PlusItem> = [
  {
    id: 'cores-back',
    label: '50% back in Cores',
    perk: 'Gives 50% back in Cores',
    status: PlusItemStatus.Ready,
    highlight: true,
    tooltip: `Every Plus payment, renewals included, gives you 50% back as Cores. Use them to award creators, boost posts, and more.`,
    icon: <CoreIcon />,
    iconClasses: 'bg-overlay-float-cheese text-accent-cheese-default',
  },
  {
    id: 'public-api',
    label: 'Full public API access and higher rate limits',
    perk: 'Unlocks the full public API',
    status: PlusItemStatus.Ready,
    highlight: true,
    tooltip: `Full API access across your feed, search, posts, and bookmarks, with higher rate limits. Plus pre-built integrations for Claude Code, Cursor, and Codex.`,
  },
  {
    id: 'custom feeds',
    label: 'Custom feeds you can query',
    perk: 'Builds feeds you can query',
    status: PlusItemStatus.Ready,
    tooltip: `Filter feeds by tools, languages, and topics. Pull them into your agent or dashboard through the feeds endpoint.`,
    icon: <HashtagIcon secondary />,
    iconClasses: 'bg-overlay-float-water text-accent-water-default',
    modalProps: {
      title: 'Custom feeds you can query',
      description:
        'Filter feeds by tools, languages, and topics. Pull them into your agent or dashboard through the feeds endpoint.',
      videoUrl: plusShowcaseCustomFeedsVideo,
      imageUrl: plusShowcaseCustomFeedsImage,
      mediaType: 'video',
    },
  },
  {
    id: 'clean titles',
    label: 'AI-cleaned titles',
    perk: 'Rewrites clickbait titles',
    status: PlusItemStatus.Ready,
    tooltip: `AI rewrites clickbait and low-signal titles so your agents and digests ingest accurate metadata, not ragebait.`,
    icon: <ShieldPlusIcon secondary />,
    iconClasses: 'bg-overlay-float-avocado text-accent-avocado-default',
    modalProps: {
      title: 'AI-cleaned titles',
      description:
        'AI rewrites clickbait and low-signal titles so your agents and digests ingest accurate metadata, not ragebait.',
      videoUrl: plusShowcaseShieldVideo,
      imageUrl: plusShowcaseShieldImage,
      mediaType: 'video',
    },
  },
  {
    id: 'bookmark folders',
    label: 'Bookmark folders',
    perk: 'Organizes bookmarks into folders',
    status: PlusItemStatus.Ready,
    tooltip: `Organize posts into folders, then pull them via the bookmarks endpoint. Great for read-later apps, digests, or Notion mirrors.`,
    icon: <FolderIcon secondary />,
    iconClasses: 'bg-overlay-float-bun text-accent-bun-default',
    modalProps: {
      title: 'Bookmark folders',
      description:
        'Organize posts into folders, then pull them via the bookmarks endpoint. Great for read-later apps, digests, or Notion mirrors.',
      videoUrl: plusShowcaseBookmarkVideo,
      imageUrl: plusShowcaseBookmarkImage,
      mediaType: 'video',
    },
  },
  {
    id: 'keyword filter',
    label: 'Keyword filters',
    perk: 'Filters out keywords you mute',
    status: PlusItemStatus.Ready,
    tooltip: `Mute buzzwords once. They apply to every feed you query, so agents don't waste tokens on noise.`,
    icon: <LabelIcon secondary />,
    iconClasses: 'bg-overlay-float-cheese text-accent-cheese-default',
    modalProps: {
      title: 'Keyword filters',
      description:
        "Mute buzzwords once. They apply to every feed you query, so agents don't waste tokens on noise.",
      imageUrl: plusShowcaseKeywordImage,
      mediaType: 'image',
    },
  },
  {
    id: 'presidential-briefing',
    label: 'Presidential Briefing',
    perk: 'Unlocks Presidential Briefing',
    status: PlusItemStatus.Ready,
    tooltip: `Your personal AI agent scans posts, videos, Squad threads, changelogs, and releases to deliver a personalized briefing in 3–5 minutes. Auto-saved to bookmarks; customize frequency and delivery (Plus only).`,
    icon: <BriefIcon secondary />,
    iconClasses: 'bg-overlay-float-mustard text-accent-mustard-default',
    modalProps: {
      title: 'Presidential Briefing',
      description:
        'Your personal AI agent scans posts, videos, Squad threads, changelogs, and releases to deliver a personalized briefing in 3–5 minutes. Auto-saved to bookmarks; customize frequency and delivery (Plus only).',
      imageUrl: plusShowcasePresidentialBriefImage,
      mediaType: 'image',
    },
  },
  {
    id: 'ad-free',
    label: 'Ad-free experience',
    perk: 'Removes every ad',
    status: PlusItemStatus.Ready,
    tooltip: `No ads. No clutter. Just pure content. Your feed, distraction-free.`,
    icon: <BlockIcon secondary />,
    iconClasses: 'bg-overlay-float-ketchup text-accent-ketchup-default',
    modalProps: {
      title: 'Ad-free experience',
      description:
        'No ads. No clutter. Just pure content. Your feed, distraction-free.',
      imageUrl: plusShowcaseAdFreeImage,
      mediaType: 'image',
    },
  },
  {
    id: 'auto-translate',
    label: 'Auto-translate your feed',
    perk: 'Translates your feed',
    status: PlusItemStatus.Ready,
    tooltip: `Translate post titles and summaries into your preferred language. Break language barriers and discover global sources without limitations.`,
    icon: <LanguageIcon secondary />,
    iconClasses: 'bg-overlay-float-bacon text-accent-bacon-default',
    modalProps: {
      title: 'Auto-translate your feed',
      description:
        'Translate post titles and summaries into your preferred language. Break language barriers and discover global sources without limitations.',
      imageUrl: plusShowcaseTranslateImage,
      mediaType: 'image',
    },
  },
  {
    id: 'bonus-quest-slots',
    label: 'Bonus quest slots',
    perk: 'Adds bonus quest slots',
    status: PlusItemStatus.Ready,
    tooltip: `Get two additional quest slots: one in your daily bucket and one in your weekly bucket. More objectives in flight, more XP, Reputation, and Cores each rotation.`,
    icon: <TourIcon secondary />,
    iconClasses: 'bg-overlay-float-blueCheese text-accent-blueCheese-default',
  },
  {
    id: 'plus-docs',
    label: 'Explore all Plus features',
    status: PlusItemStatus.Ready,
    href: plusOverviewDocs,
  },
];

export const plusOrganizationFeatureList: Array<PlusItem> = [
  {
    label: 'All premium features for every seat',
    status: PlusItemStatus.Ready,
    tooltip:
      'Every team member gets full access to daily.dev Plus—no limitations, no compromises.',
  },
  {
    label: 'Boost engagement with shared learning',
    status: PlusItemStatus.Ready,
    tooltip:
      'Create a culture of growth by discovering and discussing content as a team.',
  },
  {
    label: 'Centralized billing & user management',
    status: PlusItemStatus.Ready,
    tooltip:
      'Manage seats, billing, and team roles from a single dashboard. Simple and scalable.',
  },
  {
    label: 'Get insights on team activity',
    status: PlusItemStatus.Ready,
    tooltip:
      'See what your team is learning, reading, and engaging with—no micromanagement required.',
  },
  {
    label: 'Onboard easily with team invites',
    status: PlusItemStatus.Ready,
    tooltip:
      'Invite teammates in seconds and get them set up with Plus automatically.',
  },
  {
    label: 'Priority support for your team',
    status: PlusItemStatus.Ready,
    tooltip:
      'Get faster responses and dedicated help when your team needs it most.',
  },
];

export const briefFeatureList: Array<PlusItem> = [
  {
    label: 'Unlimited presidential briefings',
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Set your preferred schedule',
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Choose your delivery method',
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Includes all other daily.dev Plus features',
    status: PlusItemStatus.Ready,
  },
];

interface PlusListProps
  extends Omit<PlusListItemProps, 'item'>,
    WithClassNameProps {
  items?: PlusItem[];
}

// Most used first, from Plus member usage in analytics.
const plusFeaturesByUsage = [
  'presidential-briefing',
  'public-api',
  'custom feeds',
  'clean titles',
  'bookmark folders',
  'keyword filter',
  'cores-back',
  'ad-free',
  'auto-translate',
  'bonus-quest-slots',
];

const usageRank = (item: PlusItem): number => {
  const rank = plusFeaturesByUsage.indexOf(item.id ?? '');
  return rank === -1 ? plusFeaturesByUsage.length : rank;
};

const plusFeaturesInUsageOrder = plusFeatureList
  .filter((item) => !item.href)
  .sort((a, b) => usageRank(a) - usageRank(b));

export const plusPreviewPerks = plusFeaturesInUsageOrder.map(
  (item) => item.label,
);

export const plusTickerPerks = plusFeaturesInUsageOrder.flatMap(
  (item) => item.perk ?? [],
);

export const PlusList = ({
  className,
  items = plusFeatureList,
  ...props
}: PlusListProps & WithClassNameProps): ReactElement => {
  const { logEvent } = useLogContext();

  const handleItemHover = (item: PlusItem) => {
    logEvent({
      event_name: LogEvent.HoverPlusFeature,
      target_id: item.id,
      target_type: TargetType.List,
    });
  };

  const handleItemClick = (item: PlusItem) => {
    logEvent({
      event_name: LogEvent.ClickPlusFeature,
      target_id: item.id,
      target_type: TargetType.List,
    });
  };

  return (
    <ul className={classNames('flex flex-col gap-0.5 py-6', className)}>
      {items.map((item) => (
        <PlusListItem
          key={item.label}
          item={item}
          typographyProps={item.typographyProps}
          onHover={() => handleItemHover(item)}
          {...props}
          onClick={
            item.href
              ? () => {
                  handleItemClick(item);
                  props.onClick?.();
                }
              : props.onClick
          }
        />
      ))}
    </ul>
  );
};
