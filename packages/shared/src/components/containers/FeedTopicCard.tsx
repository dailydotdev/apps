import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import FeaturesContext from '../../contexts/FeaturesContext';
import { TagCategory } from '../../graphql/feedSettings';
import classed from '../../lib/classed';
import VIcon from '../icons/V';

interface FeedTopicCardProps {
  topic: TagCategory;
  isActive?: boolean;
  onClick?: () => void;
}

const BackgroundLayer = classed(
  'div',
  'group-hover:z-0 absolute inset-0 w-full h-full rounded-14 bg-theme-status-cabbage transition-transform',
);

function FeedFilterCard({
  topic,
  isActive,
  onClick,
}: FeedTopicCardProps): ReactElement {
  const { feedFilterCardVersion } = useContext(FeaturesContext);
  const isV1 = feedFilterCardVersion === 'v1';
  const isV2 = feedFilterCardVersion === 'v2';

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'relative flex justify-center items-center w-28 h-28 rounded-14 typo-callout group transition-[background] hover:shadow-2-black',
        isActive ? 'bg-theme-color-cabbage' : 'bg-theme-divider-tertiary',
        isV1 && 'hover:bg-theme-color-cabbage',
      )}
    >
      {isV1 && (
        <>
          <BackgroundLayer className="-z-1 opacity-64 group-hover:-rotate-12" />
          <BackgroundLayer className="opacity-24 -z-2 group-hover:-rotate-[24deg]" />
        </>
      )}
      {isV2 && (
        <BackgroundLayer className="opacity-64 group-hover:-rotate-[24deg]" />
      )}
      {isActive && (
        <VIcon className="absolute top-1 right-1 rounded-full bg-theme-status-invert-cabbage" />
      )}
      <span className="z-1 font-bold">{topic?.title}</span>
    </button>
  );
}

export default FeedFilterCard;
