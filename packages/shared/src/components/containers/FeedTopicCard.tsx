import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { TagCategory } from '../../graphql/feedSettings';
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
        'group relative flex aspect-square w-full min-w-[8rem] max-w-[8rem] items-center justify-center rounded-14 transition-[background] typo-callout hover:bg-accent-cabbage-default hover:shadow-2-black tablet:min-w-full',
        isActive ? 'bg-accent-cabbage-default' : 'bg-border-subtlest-tertiary',
      )}
    >
      <BackgroundLayer className="invisible -z-1 opacity-64 group-hover:visible group-hover:-rotate-12" />
      <BackgroundLayer className="invisible -z-2 opacity-24 group-hover:visible group-hover:-rotate-[24deg]" />
      <Icon isActive={isActive} />
      <span className="z-1 w-full break-words p-1 typo-callout">
        {topic?.title}
      </span>
    </button>
  );
}

export default FeedFilterCard;
