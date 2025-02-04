import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { WithClassNameProps } from '../utilities';
import type { PlusItem, PlusListItemProps } from './PlusListItem';
import { PlusItemStatus, PlusListItem } from './PlusListItem';

export const defaultFeatureList: Array<PlusItem> = [
  {
    label: 'Personalized feed',
    status: PlusItemStatus.Ready,
    tooltip: `Your go-to place for dev news, tutorials, and updates. Curated just for you, so you never miss what’s new.`,
  },
  {
    label: 'Search',
    status: PlusItemStatus.Ready,
    tooltip: `Find exactly what you’re looking for—whether it’s answers, trending topics, or the latest tools and resources.`,
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
    label: 'No ads experience',
    status: PlusItemStatus.Ready,
    tooltip: `No ads, no distractions. It’s like noise canceling headphones, but for your feed.`,
  },
  {
    label: 'AI-powered clickbait-free titles',
    status: PlusItemStatus.Ready,
    tooltip: `Say goodbye to clickbait titles and hello to AI-optimized titles that make your feed clearer and more informative.`,
  },
  {
    label: 'Organize bookmarks in folders',
    status: PlusItemStatus.Ready,
    tooltip: `Easily categorize and organize your bookmarked posts into folders, so you can find what you need quickly.`,
  },
  {
    label: 'Advanced custom feeds',
    status: PlusItemStatus.Ready,
    tooltip: `Why settle for one feed when you can have many? Build your personalized content empire, one custom feed at a time.`,
  },
  {
    label: 'Block posts with unwanted words',
    status: PlusItemStatus.Ready,
    tooltip: `Automatically filter out posts containing words you never want to see again. Life’s too short for unnecessary noise.`,
  },
  {
    label: 'Exclusive Plus badge',
    status: PlusItemStatus.Ready,
    tooltip: `This badge is like a VIP pass, but for devs who love daily.dev. Flex it on your profile as if you just shipped flawless code.`,
  },
  {
    label: 'Private Squad for Plus members',
    status: PlusItemStatus.Ready,
    tooltip: `Join an exclusive community space to connect with other Plus members, share feedback, and access priority support.`,
  },
  {
    label: 'Support the team and make us smile',
    status: PlusItemStatus.Ready,
    tooltip: `By subscribing to Plus, you help us suffer less and build more (well… mostly suffer less).`,
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
  return (
    <ul className={classNames('flex flex-col gap-0.5 py-6', className)}>
      {items.map((item) => (
        <PlusListItem key={item.label} item={item} {...props} />
      ))}
    </ul>
  );
};
