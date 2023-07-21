import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { TagCategory } from '../../graphql/feedSettings';
import classed from '../../lib/classed';
import VIcon from '../icons/V';

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
  'group-hover:z-0 absolute inset-0 w-full h-full rounded-14 bg-theme-status-cabbage transition-transform',
);

interface IconProps {
  isActive: boolean;
}

const Icon = ({ isActive }: IconProps) => {
  const iconClasses = classNames(
    'absolute rounded-full top-1 right-1',
    isActive && 'bg-theme-status-invert-cabbage',
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
        'relative flex max-w-[8rem] min-w-[8rem] tablet:min-w-full items-center rounded-14 typo-callout group transition-[background] hover:shadow-2-black justify-center w-full aspect-square hover:bg-theme-color-cabbage',
        isActive ? 'bg-theme-color-cabbage' : 'bg-theme-divider-tertiary',
      )}
    >
      <BackgroundLayer className="invisible group-hover:visible -z-1 opacity-64 group-hover:-rotate-12" />
      <BackgroundLayer className="invisible group-hover:visible opacity-24 -z-2 group-hover:-rotate-[24deg]" />
      <Icon isActive={isActive} />
      <span className="z-1 p-1 w-full break-words typo-callout">
        {topic?.title}
      </span>
    </button>
  );
}

export default FeedFilterCard;
