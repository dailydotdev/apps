import React, { ReactElement } from 'react';
import { WritePageContainer } from './common';
import { WritePostHeader } from './WritePostHeader';
import {
  WriteFreeformContent,
  WriteFreeformContentProps,
} from './WriteFreeformContent';
import { WriteFreeFormSkeleton } from './WriteFreeFormSkeleton';
import { verifyPermission } from '../../../../graphql/squads';
import { SourcePermissions, Squad } from '../../../../graphql/sources';
import Unauthorized from '../../../errors/Unauthorized';

interface WritePageProps extends Omit<WriteFreeformContentProps, 'squadId'> {
  isEdit?: boolean;
  isLoading?: boolean;
  isForbidden?: boolean;
  squad: Squad;
}

export function WritePage({
  isEdit,
  squad,
  isLoading,
  isForbidden,
  ...props
}: WritePageProps): ReactElement {
  const isVerified = verifyPermission(squad, SourcePermissions.Post);

  if (isLoading) return <WriteFreeFormSkeleton isEdit={isEdit} />;

  if (isForbidden || !isVerified || !squad) return <Unauthorized />;

  return (
    <WritePageContainer>
      <WritePostHeader squad={squad} isEdit={isEdit} />
      <WriteFreeformContent {...props} squadId={squad.id} />
    </WritePageContainer>
  );
}
