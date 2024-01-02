import React, { ReactElement } from 'react';
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
      <WritePageMain className="px-6 py-5">
        <ElementPlaceholder className="h-24 w-40 rounded-16" />
        <ElementPlaceholder className="mt-6 h-12 rounded-12" />
        <ElementPlaceholder className="mt-4 h-60 rounded-12" />
        <span className="mt-8 flex flex-row items-center">
          <ElementPlaceholder className="hidden h-6 w-12 rounded-6 tablet:flex" />
          <ElementPlaceholder className="mr-20 h-6 flex-1 rounded-6 tablet:ml-4" />
          <ElementPlaceholder className="h-6 w-16 rounded-8 tablet:h-10 tablet:w-36 tablet:rounded-12" />
        </span>
      </WritePageMain>
    </WritePageContainer>
  );
}
