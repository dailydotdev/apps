import React, { ComponentProps, ReactElement } from 'react';
import classNames from 'classnames';
import { CardTextContainer } from '../Card';
import { ElementPlaceholder } from '../../ElementPlaceholder';

interface PlaceholderSquadGridProps extends ComponentProps<'div'> {
  isFeatured?: boolean;
}

const Text = ({
  className,
  ...attrs
}: ComponentProps<typeof ElementPlaceholder>) => (
  <ElementPlaceholder
    {...attrs}
    className={classNames('h-3.5 rounded-12', className)}
  />
);

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
        'w-[19rem] overflow-hidden rounded-16 border-0 bg-background-subtle p-4',
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
          {isFeatured && <Text className="h-8 flex-1" />}
        </header>

        <section>
          <Text className="mb-2 h-4 w-1/2" />
          {isFeatured && <Text className="mb-2 h-4 w-1/3" />}
          {textLines.map((i) => (
            <Text key={`text-${i}`} className="my-1.5 w-full" />
          ))}
        </section>
        <div className="mt-2 flex flex-row gap-2">
          {isFeatured ? (
            <div className="mt-2.5 w-full">
              <Text className="mt-5 min-h-10 w-full pt-2.5" />
            </div>
          ) : (
            <>
              <Text className="mb-0 w-1/3" />
              <Text className="mb-0 w-1/3" />
            </>
          )}
        </div>
      </CardTextContainer>
    </div>
  );
};

export const PlaceholderSquadGridList = (props: PlaceholderSquadGridProps) => {
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
