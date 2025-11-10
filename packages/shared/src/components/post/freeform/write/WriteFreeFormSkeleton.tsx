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
      <WritePageMain className="px-6 py-5">
        <ElementPlaceholder className="rounded-16 h-24 w-40" />
        <ElementPlaceholder className="rounded-12 mt-6 h-12" />
        <ElementPlaceholder className="rounded-12 mt-4 h-60" />
        <span className="mt-8 flex flex-row items-center">
          <ElementPlaceholder className="rounded-6 tablet:flex hidden h-6 w-12" />
          <ElementPlaceholder className="rounded-6 tablet:ml-4 mr-20 h-6 flex-1" />
          <ElementPlaceholder className="rounded-8 tablet:h-10 tablet:w-36 tablet:rounded-12 h-6 w-16" />
        </span>
      </WritePageMain>
    </WritePageContainer>
  );
}
