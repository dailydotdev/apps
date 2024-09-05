import React, { ReactElement, ReactNode } from 'react';

import Unauthorized from '../../../errors/Unauthorized';
import { WritePageContainer } from './common';
import { WriteFreeFormSkeleton } from './WriteFreeFormSkeleton';

interface WritePageProps {
  isEdit?: boolean;
  isLoading?: boolean;
  isForbidden?: boolean;
  children?: ReactNode;
}

export function WritePage({
  isEdit,
  isLoading,
  isForbidden,
  children,
}: WritePageProps): ReactElement {
  if (isLoading) {
    return <WriteFreeFormSkeleton isEdit={isEdit} />;
  }

  if (isForbidden) {
    return <Unauthorized />;
  }

  return <WritePageContainer>{children}</WritePageContainer>;
}
