import React, { HTMLAttributes, ReactElement, useState } from 'react';
import classNames from 'classnames';
import UserIcon from './icons/User';
import classed from '../lib/classed';

const tagsRows = [
  ['', '#docker', '', '#kubernetes', ''],
  ['', '', '#architecture', '', ''],
  ['', '', '', '#devops', ''],
  ['', '#cloud', '', '', ''],
];
const emptyWidths = ['w-[4.5rem]', 'w-24', 'w-[7.5rem]'];

const Pill = classed(
  'span',
  'flex items-center h-8 p-4 truncate rounded-10 typo-callout text-theme-label-primary',
);
const FeedFiltersIntroModalTagsContainer = classed('div', 'w-[160%]');

type TagPillProps = { autoWidth: boolean } & HTMLAttributes<HTMLSpanElement>;
const TagPill = ({
  className,
  children,
  autoWidth,
}: TagPillProps): ReactElement => {
  if (autoWidth) {
    return <Pill className={className}>{children}</Pill>;
  }

  const [pillWidth] = useState(
    () => emptyWidths[Math.floor(Math.random() * emptyWidths.length)],
  );

  return <Pill className={classNames(className, pillWidth)}>{children}</Pill>;
};

export const MyFeedIntro = (): ReactElement => {
  return (
    <div className="flex overflow-hidden flex-col justify-center items-center p-6 mobileL:px-10 h-full">
      <UserIcon size="xxxxlarge" />
      <h3 className="mt-4 font-bold typo-large-title">Create my feed</h3>
      <p className="mt-3 mb-16 text-center typo-title3 text-theme-label-tertiary">
        Devs with a personal feed get 11.5x more relevant articles
      </p>
      <FeedFiltersIntroModalTagsContainer>
        {/* eslint-disable react/no-array-index-key */}
        {tagsRows.map((row, i) => (
          <ul className="flex gap-3 mb-3" key={i}>
            {row.map((tag, j) => (
              <TagPill
                autoWidth={!!tag.length}
                className={classNames(
                  (j === 0 || j === row.length - 1) && 'flex-1',
                  !tag.length
                    ? 'rounded-10 bg-theme-float'
                    : 'flex-shrink w-auto bg-theme-label-disabled',
                )}
                key={`${i}_${j}`}
              >
                {tag}
              </TagPill>
            ))}
          </ul>
        ))}
        {/* eslint-disable react/no-array-index-key */}
      </FeedFiltersIntroModalTagsContainer>
    </div>
  );
};
