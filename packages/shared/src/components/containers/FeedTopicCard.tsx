import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { TagCategory } from '../../graphql/feedSettings';
import classed from '../../lib/classed';
import { OnboardingFiltersLayout } from '../../lib/featureValues';
import PlusIcon from '../icons/Plus';
import VIcon from '../icons/V';

export type ButtonEvent =
  | React.MouseEvent<HTMLButtonElement>
  | React.KeyboardEvent<HTMLButtonElement>;

interface FeedTopicCardProps {
  topic: TagCategory;
  isActive?: boolean;
  topicLayout?: OnboardingFiltersLayout;
  onClick?: (e: ButtonEvent) => void;
}

interface ClassName {
  container?: string;
  check?: string;
  text?: string;
}

const BackgroundLayer = classed(
  'div',
  'group-hover:z-0 absolute inset-0 w-full h-full rounded-14 bg-theme-status-cabbage transition-transform',
);

const background: Record<OnboardingFiltersLayout, ReactNode> = {
  grid: (
    <>
      <BackgroundLayer className="-z-1 opacity-64 group-hover:-rotate-12" />
      <BackgroundLayer className="opacity-24 -z-2 group-hover:-rotate-[24deg]" />
    </>
  ),
  list: <BackgroundLayer className="hidden group-hover:flex opacity-64" />,
};

const classes: Record<OnboardingFiltersLayout, ClassName> = {
  grid: {
    container:
      'justify-center w-full aspect-square hover:bg-theme-color-cabbage',
    check: 'top-1 right-1',
    text: 'typo-callout',
  },
  list: {
    container: 'pl-4 w-full h-[3.75rem]',
    check: 'right-4',
    text: 'typo-body',
  },
};

interface IconProps {
  layout: OnboardingFiltersLayout;
  isActive: boolean;
}

const Icon = ({ layout, isActive }: IconProps) => {
  const iconClasses = classNames(
    'absolute rounded-full',
    classes[layout].check,
    isActive && 'bg-theme-status-invert-cabbage',
  );

  if (isActive) {
    return <VIcon className={iconClasses} />;
  }

  if (layout === OnboardingFiltersLayout.List) {
    return <PlusIcon className={iconClasses} />;
  }

  return null;
};

function FeedFilterCard({
  topic,
  isActive,
  topicLayout = OnboardingFiltersLayout.Grid,
  onClick,
}: FeedTopicCardProps): ReactElement {
  const backgroundLayers = background[topicLayout];

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'relative flex max-w-[8rem] min-w-[8rem] tablet:min-w-full items-center rounded-14 typo-callout group transition-[background] hover:shadow-2-black',
        isActive ? 'bg-theme-color-cabbage' : 'bg-theme-divider-tertiary',
        classes[topicLayout].container,
      )}
    >
      {backgroundLayers}
      <Icon layout={topicLayout} isActive={isActive} />
      <span
        className={classNames(
          'z-1 p-1 w-full break-words',
          classes[topicLayout].text,
        )}
      >
        {topic?.title}
      </span>
    </button>
  );
}

export default FeedFilterCard;
