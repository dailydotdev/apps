import React, { ReactElement } from 'react';
import { ManageSquadPageMain, ManageSquadPageContainer } from './utils';
import { ElementPlaceholder } from '../ElementPlaceholder';

export const MangeSquadPageSkeleton = (): ReactElement => {
  return (
    <ManageSquadPageContainer>
      <ManageSquadPageMain className="items-center">
        <ElementPlaceholder className="h-48 w-full" />
        <div className="flex w-full max-w-lg flex-col items-center">
          <ElementPlaceholder className="mx-8 mt-6 h-12 w-full rounded-12" />
          <ElementPlaceholder className="mx-8 mt-4 h-12 w-full rounded-12" />
        </div>
      </ManageSquadPageMain>
    </ManageSquadPageContainer>
  );
};
