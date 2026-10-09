import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CardTextContainer } from '../common/Card';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import {
  BodyTextPlaceholder,
  TitleTextPlaceholder,
} from '../../widgets/common';

interface PlaceholderSquadGridProps extends ComponentProps<'div'> {
  isFeatured?: boolean;
}

export const PlaceholderSquadGrid = ({
  className,
  isFeatured,
  ...attrs
}: PlaceholderSquadGridProps): ReactElement => {
  const descriptionLength = isFeatured ? 5 : 2;
  const textLines = Array.from({ length: descriptionLength }).map((_, i) => i);

  return (
    <div
      {...attrs}
      aria-busy
      className={classNames(
        'flex flex-col overflow-hidden rounded-16 p-4',
        className,
      )}
    >
      <CardTextContainer>
        <header className="mb-3 flex flex-row items-end gap-4">
          <ElementPlaceholder
            className={classNames(
              'rounded-full',
              isFeatured ? '-mt-2 mb-2 size-24' : 'size-16',
            )}
          />
          {isFeatured && <TitleTextPlaceholder className="flex-1" />}
        </header>

        <section>
          <TitleTextPlaceholder className="mb-2 w-1/2" />
          {isFeatured && <BodyTextPlaceholder className="mb-2 w-1/3" />}
          {textLines.map((i) => (
            <BodyTextPlaceholder key={`text-${i}`} className="my-1.5 w-full" />
          ))}
        </section>
        <div className="mt-2 flex flex-row gap-2">
          {isFeatured ? (
            <ElementPlaceholder className="mt-5 h-10 w-full rounded-12" />
          ) : (
            <>
              <ElementPlaceholder className="h-10 w-1/3 rounded-12" />
              <ElementPlaceholder className="h-10 w-1/3 rounded-12" />
            </>
          )}
        </div>
      </CardTextContainer>
    </div>
  );
};

export const PlaceholderSquadGridList = (
  props: PlaceholderSquadGridProps,
): ReactElement => {
  return (
    <>
      <PlaceholderSquadGrid {...props} />
      <PlaceholderSquadGrid {...props} />
      <PlaceholderSquadGrid {...props} />
      <PlaceholderSquadGrid {...props} />
      <PlaceholderSquadGrid {...props} />
      <PlaceholderSquadGrid {...props} />
    </>
  );
};
