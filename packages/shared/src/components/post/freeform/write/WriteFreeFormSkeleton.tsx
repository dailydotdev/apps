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
      <WritePostHeader squad={null} isEdit={isEdit} />
      <WritePageMain>
        <ElementPlaceholder className="w-40 h-24 rounded-16" />
        <ElementPlaceholder className="mt-6 h-12 rounded-12" />
        <ElementPlaceholder className="mt-4 h-60 rounded-12" />
        <span className="flex flex-row items-center mt-8">
          <ElementPlaceholder className="hidden tablet:flex w-12 h-6 rounded-6" />
          <ElementPlaceholder className="flex-1 mr-20 tablet:ml-4 h-6 rounded-6" />
          <ElementPlaceholder className="w-16 tablet:w-36 h-6 tablet:h-10 rounded-8 tablet:rounded-12" />
        </span>
      </WritePageMain>
    </WritePageContainer>
  );
}
