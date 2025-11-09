import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../../ElementPlaceholder';

type PlaceholderSquadListProps = ComponentProps<'div'>;

const Text = ({
  className,
  ...attrs
}: ComponentProps<typeof ElementPlaceholder>) => (
  <ElementPlaceholder
    {...attrs}
    className={classNames('rounded-12 h-3.5 animate-pulse', className)}
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
      <Text className="w-18 min-h-10" />
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
