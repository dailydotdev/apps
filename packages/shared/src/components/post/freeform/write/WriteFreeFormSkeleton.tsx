import type { ReactElement } from 'react';
import React from 'react';
import { WritePageContainer, WritePageMain } from './common';
import { WritePostHeader } from './WritePostHeader';
import { ElementPlaceholder } from '../../../ElementPlaceholder';

interface WriteFreeFormSkeletonProps {
  isEdit?: boolean;
}

export function WriteFreeFormSkeleton({
  isEdit,
}: WriteFreeFormSkeletonProps): ReactElement {
  return (
    <WritePageContainer>
      <WritePostHeader isEdit={isEdit} />
      <WritePageMain className="gap-4 px-6 py-5">
        <ElementPlaceholder className="w h-12 rounded-12 laptop:max-w-70" />
        <ElementPlaceholder className="h-24 w-[11.5rem] rounded-16" />
        <ElementPlaceholder className="h-12 rounded-12" />
        <ElementPlaceholder className="h-[25.5rem] rounded-12" />

        <ElementPlaceholder className="ml-auto h-6 w-16 rounded-8 tablet:h-10 tablet:w-32 tablet:rounded-12" />
      </WritePageMain>
    </WritePageContainer>
  );
}
