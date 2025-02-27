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
    label: 'Run prompts on any post',
    status: PlusItemStatus.Ready,
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
    tooltip: `No more misinformation. AI rewrites titles so you see the real story at a glance and dive in only when relevant.`,
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
    label: 'Auto-translate your feed',
    status: PlusItemStatus.ComingSoon,
    tooltip: `Translate post titles and summaries into your language for a smoother learning experience.`,
  },
  {
    label: 'Keyword filters',
    status: PlusItemStatus.Ready,
    tooltip: `Mute the buzzwords you’re sick of hearing. More signal, less noise.`,
  },
  {
    label: 'Members-only Squad',
    status: PlusItemStatus.Ready,
    tooltip: `Join an exclusive community space to connect with other Plus members, share feedback, and get priority support.`,
  },
  {
    label: 'Support the team and make us smile',
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
  return (
    <ul className={classNames('flex flex-col gap-0.5 py-6', className)}>
      {items.map((item) => (
        <PlusListItem key={item.label} item={item} {...props} />
      ))}
    </ul>
  );
};
