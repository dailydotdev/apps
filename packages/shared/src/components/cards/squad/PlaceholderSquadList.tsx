import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { BodyTextPlaceholder } from '../../widgets/common';

type PlaceholderSquadListProps = ComponentProps<'div'>;

export const PlaceholderSquadList = ({
  className,
  ...attrs
}: PlaceholderSquadListProps): ReactElement => {
  return (
    <div {...attrs} aria-busy className="flex flex-row items-center gap-4">
      <ElementPlaceholder className="size-14 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <BodyTextPlaceholder className="w-1/2" />
        <BodyTextPlaceholder className="w-full" />
      </div>
      <ElementPlaceholder className="h-10 w-18 rounded-12" />
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
