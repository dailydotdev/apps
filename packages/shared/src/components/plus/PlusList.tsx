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
  CustomPromptIcon,
  FolderIcon,
  HashtagIcon,
  LabelIcon,
  LanguageIcon,
  ShieldPlusIcon,
  SourceIcon,
  UserShareIcon,
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
  plusShowcaseSmartPrompsImage,
  plusShowcaseSmartPrompsVideo,
  plusShowcaseSquadImage,
  plusShowcaseTeamImage,
  plusShowcaseTeamVideo,
  plusShowcaseTranslateImage,
} from '../../lib/image';

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
    id: 'presidential-briefing',
    label: 'Unlimited presidential briefings',
    status: PlusItemStatus.Ready,
    tooltip: `Your AI agent scans the internet, reads the latest dev content, filters the noise, and delivers a personalized briefing of what actually matters.`,
    icon: <BriefIcon secondary />,
    iconClasses: 'bg-overlay-float-mustard text-accent-mustard-default',
    modalProps: {
      title: 'Unlimited presidential briefings',
      description:
        'Your AI agent scans the internet, reads the latest dev content, filters the noise, and delivers a personalized briefing of what actually matters.',
      imageUrl: plusShowcasePresidentialBriefImage,
      mediaType: 'image',
    },
  },
  {
    id: 'smart prompts',
    label: 'Run prompts on any post',
    status: PlusItemStatus.Ready,
    tooltip: `Turn any post into an interactive learning experience. Ask AI to simplify concepts, challenge ideas, compare alternatives, or create your own custom prompt.`,
    icon: <CustomPromptIcon secondary />,
    iconClasses: 'bg-overlay-float-bacon text-accent-bacon-default',
    modalProps: {
      title: 'Run prompts on any post',
      description:
        'Turn any post into an interactive learning experience. Ask AI to simplify concepts, challenge ideas, compare alternatives, or create your own custom prompt.',
      videoUrl: plusShowcaseSmartPrompsVideo,
      imageUrl: plusShowcaseSmartPrompsImage,
      mediaType: 'video',
    },
  },
  {
    id: 'custom feeds',
    label: 'Advanced custom feeds',
    status: PlusItemStatus.Ready,
    tooltip: `Build laser-focused feeds for the tools, languages, and topics you care about. Search less, learn more.`,
    icon: <HashtagIcon secondary />,
    iconClasses: 'bg-overlay-float-water text-accent-water-default',
    modalProps: {
      title: 'Advanced custom feeds',
      description:
        'Build laser-focused feeds for the tools, languages, and topics you care about. Search less, learn more.',
      videoUrl: plusShowcaseCustomFeedsVideo,
      imageUrl: plusShowcaseCustomFeedsImage,
      mediaType: 'video',
    },
  },
  {
    id: 'clean titles',
    label: 'AI-powered clean titles',
    status: PlusItemStatus.Ready,
    tooltip: `No more misinformation. AI rewrites titles so you see the real story at a glance and dive in only when relevant.`,
    icon: <ShieldPlusIcon secondary />,
    iconClasses: 'bg-overlay-float-avocado text-accent-avocado-default',
    modalProps: {
      title: 'AI-powered clean titles',
      description:
        'No more misinformation. AI rewrites titles so you see the real story at a glance and dive in only when relevant.',
      videoUrl: plusShowcaseShieldVideo,
      imageUrl: plusShowcaseShieldImage,
      mediaType: 'video',
    },
  },
  {
    id: 'bookmark folders',
    label: 'Bookmark folders',
    status: PlusItemStatus.Ready,
    tooltip: `Easily categorize and organize your bookmarked posts into folders so you can find what you need quickly.`,
    icon: <FolderIcon secondary />,
    iconClasses: 'bg-overlay-float-bun text-accent-bun-default',
    modalProps: {
      title: 'Bookmark folders',
      description:
        'Easily categorize and organize your bookmarked posts into folders so you can find what you need quickly.',
      videoUrl: plusShowcaseBookmarkVideo,
      imageUrl: plusShowcaseBookmarkImage,
      mediaType: 'video',
    },
  },
  {
    id: 'ad-free',
    label: 'Ad-free experience',
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
    status: PlusItemStatus.Ready,
    tooltip: `Translate post titles and summaries into your language for a smoother learning experience.`,
    icon: <LanguageIcon secondary />,
    iconClasses: 'bg-overlay-float-bacon text-accent-bacon-default',
    modalProps: {
      title: 'Auto-translate your feed',
      description:
        'Make your feed more accessible with automatically translated post titles in your preferred language.',
      imageUrl: plusShowcaseTranslateImage,
      mediaType: 'image',
    },
  },
  {
    id: 'keyword filter',
    label: 'Keyword filters',
    status: PlusItemStatus.Ready,
    tooltip: `Mute the buzzwords you're sick of hearing. More signal, less noise.`,
    icon: <LabelIcon secondary />,
    iconClasses: 'bg-overlay-float-cheese text-accent-cheese-default',
    modalProps: {
      title: 'Keyword filters',
      description:
        'Mute the buzzwords you’re sick of hearing. More signal, less noise.',
      imageUrl: plusShowcaseKeywordImage,
      mediaType: 'image',
    },
  },
  {
    id: 'member squad',
    label: 'Members-only Squad',
    status: PlusItemStatus.Ready,
    tooltip: `Join an exclusive community space to connect with other Plus members, share feedback, and get priority support.`,
    icon: <SourceIcon secondary />,
    iconClasses: 'bg-overlay-float-cabbage text-accent-cabbage-default',
    modalProps: {
      title: 'Members-only Squad',
      description:
        'Join an exclusive community space to connect with other Plus members, share feedback, and get priority support.',
      imageUrl: plusShowcaseSquadImage,
      mediaType: 'image',
    },
  },
  {
    id: 'support team',
    label: 'Support the team and make us smile',
    status: PlusItemStatus.Ready,
    tooltip: `By subscribing to Plus, you help us suffer less and build more (well... mostly suffer less).`,
    icon: <UserShareIcon secondary />,
    iconClasses: 'bg-overlay-float-bacon text-accent-bacon-default',
    modalProps: {
      title: 'Support the team and make us smile',
      description:
        'By subscribing to Plus, you help us suffer less and build more (well... mostly suffer less).',
      videoUrl: plusShowcaseTeamVideo,
      imageUrl: plusShowcaseTeamImage,
      mediaType: 'video',
    },
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

  return (
    <ul className={classNames('flex flex-col gap-0.5 py-6', className)}>
      {items.map((item) => (
        <PlusListItem
          key={item.label}
          item={item}
          typographyProps={item.typographyProps}
          onHover={() => handleItemHover(item)}
          {...props}
        />
      ))}
    </ul>
  );
};
