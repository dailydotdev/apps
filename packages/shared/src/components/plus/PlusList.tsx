import React, { ReactElement, useMemo } from 'react';
import classNames from 'classnames';
import { WithClassNameProps } from '../utilities';
import {
  PlusItem,
  PlusItemStatus,
  PlusListItem,
  PlusListItemProps,
} from './PlusListItem';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';

export const defaultFeatureList: Array<PlusItem> = [
  { label: 'Hyper-personalized feed', status: PlusItemStatus.Ready },
  { label: 'AI-powered search', status: PlusItemStatus.Ready },
  { label: 'Squads (developer communities)', status: PlusItemStatus.Ready },
  { label: 'Advanced customizations', status: PlusItemStatus.Ready },
  { label: '100+ more features', status: PlusItemStatus.Ready },
];

export const plusFeatureList: Array<PlusItem> = [
  {
    label: 'No ads experience',
    status: PlusItemStatus.Ready,
    tooltip: `No ads, no distractions. It’s like noise canceling headphones, but for your feed.`,
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
  {
    label: 'Clickbait-free titles powered by AI',
    status: PlusItemStatus.ComingSoon,
    tooltip: `Say goodbye to clickbait titles and hello to AI-optimized titles that make your feed clearer and more informative.`,
  },
  {
    label: 'Organize bookmarks in folders',
    status: PlusItemStatus.ComingSoon,
    tooltip: `Easily categorize and organize your bookmarked posts into folders, so you can find what you need quickly.`,
  },
  {
    label: 'Keyword blocker',
    status: PlusItemStatus.ComingSoon,
    tooltip: `Automatically filter out posts containing words you never want to see again. Life’s too short for unnecessary noise.`,
  },
  {
    label: 'Advanced custom feeds',
    status: PlusItemStatus.ComingSoon,
    tooltip: `Why settle for one feed when you can have many? Build your personalized content empire, one custom feed at a time.`,
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
  const isEarlyAdopterExperiment = useFeature(feature.plusEarlyAdopter);
  const list = useMemo(
    () =>
      items.filter(
        (item) =>
          isEarlyAdopterExperiment || item.status !== PlusItemStatus.ComingSoon,
      ),
    [items, isEarlyAdopterExperiment],
  );
  const hasFilteredComingSoon =
    !isEarlyAdopterExperiment && list.length !== items.length;

  return (
    <ul
      className={classNames(
        'flex flex-col py-6',
        isEarlyAdopterExperiment ? 'gap-0.5' : 'gap-2',
        className,
      )}
    >
      {list.map((item) => (
        <PlusListItem key={item.label} item={item} {...props} />
      ))}
      {hasFilteredComingSoon && (
        <PlusListItem
          item={{
            label: 'And so much more coming soon...',
            status: PlusItemStatus.Ready,
          }}
          {...props}
        />
      )}
    </ul>
  );
};
