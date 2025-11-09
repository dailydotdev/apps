import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import type { TagCategory } from '../../graphql/feedSettings';
import classed from '../../lib/classed';
import { VIcon } from '../icons';

export type ButtonEvent =
  | React.MouseEvent<HTMLButtonElement>
  | React.KeyboardEvent<HTMLButtonElement>;

interface FeedTopicCardProps {
  topic: TagCategory;
  isActive?: boolean;
  onClick?: (e: ButtonEvent) => void;
  isAnimated?: boolean;
}

const BackgroundLayer = classed(
  'div',
  'group-hover:z-0 absolute inset-0 w-full h-full rounded-14 bg-accent-cabbage-default transition-transform',
);

interface IconProps {
  isActive: boolean;
}

const Icon = ({ isActive }: IconProps) => {
  const iconClasses = classNames(
    'absolute right-1 top-1 rounded-full',
    isActive && 'bg-accent-cabbage-bolder',
  );

  if (isActive) {
    return <VIcon className={iconClasses} />;
  }

  return null;
};

function FeedFilterCard({
  topic,
  isActive,
  onClick,
}: FeedTopicCardProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'rounded-14 typo-callout hover:bg-accent-cabbage-default hover:shadow-2-black tablet:min-w-full group relative flex aspect-square w-full min-w-[8rem] max-w-[8rem] items-center justify-center transition-[background]',
        isActive ? 'bg-accent-cabbage-default' : 'bg-border-subtlest-tertiary',
      )}
    >
      <BackgroundLayer className="-z-1 opacity-64 invisible group-hover:visible group-hover:-rotate-12" />
      <BackgroundLayer className="-z-2 opacity-24 invisible group-hover:visible group-hover:-rotate-[24deg]" />
      <Icon isActive={isActive} />
      <span className="z-1 typo-callout w-full break-words p-1">
        {topic?.title}
      </span>
    </button>
  );
}

export default FeedFilterCard;
