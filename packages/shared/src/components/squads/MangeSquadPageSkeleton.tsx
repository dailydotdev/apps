import React, { ReactElement } from 'react';
import {
  ManageSquadPageMain,
  ManageSquadPageFooter,
  ManageSquadPageContainer,
} from './utils';
import { ElementPlaceholder } from '../ElementPlaceholder';

export const MangeSquadPageSkeleton = (): ReactElement => {
  return (
    <ManageSquadPageContainer>
      <ManageSquadPageMain className="items-center">
        <ElementPlaceholder className="w-full h-48" />
        <div className="flex flex-col items-center w-full max-w-lg">
          <ElementPlaceholder className="mx-8 mt-6 w-full h-12 rounded-12" />
          <ElementPlaceholder className="mx-8 mt-4 w-full h-12 rounded-12" />
        </div>
      </ManageSquadPageMain>
      <ManageSquadPageFooter />
    </ManageSquadPageContainer>
  );
};
