import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { WithClassNameProps } from '../utilities';
import type { PlusItem, PlusListItemProps } from './PlusListItem';
import { PlusItemStatus, PlusListItem } from './PlusListItem';
import { usePaymentContext } from '../../contexts/PaymentContext';

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
    label: 'Chat with posts using AI',
    status: PlusItemStatus.ComingSoon,
    tooltip: `Turn any post into an interactive learning experience. Ask AI to simplify concepts, challenge ideas, compare alternatives, or create your own custom prompt.`,
  },
  {
    label: 'Advanced custom feeds',
    status: PlusItemStatus.Ready,
    tooltip: `Build laser-focused feeds for the tools, languages, and topics you care about. Search less, learn more.`,
  },
  {
    label: 'AI-powered clean titles',
    status: PlusItemStatus.Ready,
    tooltip: `No more misinformation. AI rewrites titles so you see the real story at a glance and dive in only when it’s relevant.`,
  },
  {
    label: 'Bookmark folders',
    status: PlusItemStatus.Ready,
    tooltip: `Easily categorize and organize your bookmarked posts into folders so you can find what you need quickly.`,
  },
  {
    label: 'Ad-free experience',
    status: PlusItemStatus.Ready,
    tooltip: `No ads. No clutter. Just pure content. Your feed, distraction-free.`,
  },
  {
    label: 'Keyword filters',
    status: PlusItemStatus.Ready,
    tooltip: `Mute the buzzwords you’re sick of hearing. More signal, less noise.`,
  },
  {
    label: 'Exclusive Plus Squad',
    status: PlusItemStatus.Ready,
    tooltip: `Join an exclusive community space to connect with other Plus members, share feedback, and get priority support.`,
  },
  {
    label: 'Support daily.dev',
    status: PlusItemStatus.Ready,
    tooltip: `By subscribing to Plus, you help us suffer less and build more (well... mostly suffer less).`,
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
  const { earlyAdopterPlanId } = usePaymentContext();
  const isEarlyAdopterExperiment = !!earlyAdopterPlanId;

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
    <ul className={classNames('flex flex-col gap-0.5 py-6', className)}>
      {list.map((item) => (
        <PlusListItem key={item.label} item={item} {...props} />
      ))}
      {/* On cleanup: remove this additional item if ComingSoon experiment won */}
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
