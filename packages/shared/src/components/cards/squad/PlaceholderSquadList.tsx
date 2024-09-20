import React, { ComponentProps, ReactElement } from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../../ElementPlaceholder';

type PlaceholderSquadListProps = ComponentProps<'div'>;

const Text = ({
  className,
  ...attrs
}: ComponentProps<typeof ElementPlaceholder>) => (
  <ElementPlaceholder
    {...attrs}
    className={classNames('h-3.5 animate-pulse rounded-12', className)}
  />
);

export const PlaceholderSquadList = ({
  className,
  ...attrs
}: PlaceholderSquadListProps): ReactElement => {
  return (
    <div {...attrs} aria-busy className="flex flex-row items-center gap-4">
      <ElementPlaceholder className="size-14 rounded-full" />
      <div className="min-w-0 flex-1">
        <Text className="mb-1 w-1/2" />
        <Text className="w-full" />
      </div>
      <Text className="min-h-10 w-18" />
    </div>
  );
};

export const PlaceholderSquadListList = (
  props: PlaceholderSquadListProps,
): ReactElement => {
  return (
    <>
      <PlaceholderSquadList {...props} />
      <PlaceholderSquadList {...props} />
      <PlaceholderSquadList {...props} />
      <PlaceholderSquadList {...props} />
      <PlaceholderSquadList {...props} />
      <PlaceholderSquadList {...props} />
    </>
  );
};
