import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { BodyTextPlaceholder, TextPlaceholder } from '../widgets/common';
import { tagDirectoryLetters } from './TagDirectoryFilter';

const rowWidths = ['w-1/2', 'w-2/5', 'w-3/5', 'w-1/3', 'w-1/2', 'w-2/5'];

export function TagLetterGridPlaceholder(): ReactElement {
  return (
    <div className="flex w-full flex-wrap items-center gap-1 tablet:justify-center">
      <span className="flex h-8 w-[2.625rem] items-center justify-center">
        <ElementPlaceholder className="h-6 w-7 rounded-8" />
      </span>
      {tagDirectoryLetters.map((letter) => (
        <span
          key={letter}
          className="flex h-8 min-w-8 items-center justify-center"
        >
          <ElementPlaceholder className="size-6 rounded-8" />
        </span>
      ))}
    </div>
  );
}

interface TagSectionsPlaceholderProps {
  className?: string;
  sections?: number;
}

export function TagSectionsPlaceholder({
  className,
  sections = 3,
}: TagSectionsPlaceholderProps): ReactElement {
  return (
    <div className={classNames('grid w-full grid-cols-1', className)}>
      {Array.from({ length: sections }, (_, section) => (
        <div key={section} className="flex min-w-0 flex-col gap-3">
          <span className="flex h-[1.375rem] items-center">
            <BodyTextPlaceholder className="w-32" />
          </span>
          <div className="-mx-2 flex flex-col tablet:mx-0">
            {rowWidths.map((width, row) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={row} className="flex h-8 items-center px-2">
                <TextPlaceholder className={width} />
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
