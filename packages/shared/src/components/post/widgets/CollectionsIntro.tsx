import React, { ReactElement } from 'react';
import CloseButton from '../../CloseButton';
import { ButtonSize } from '../../buttons/Button';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';

export function CollectionsIntro(): ReactElement {
  const { checkHasCompleted, completeAction } = useActions();

  if (checkHasCompleted(ActionType.CollectionsIntro)) {
    return null;
  }

  return (
    <span className="flex relative flex-row p-3 pr-2 w-full rounded-10 border border-theme-color-cabbage">
      <div className="flex flex-col flex-1 typo-subhead">
        <strong>Introducing collections!</strong>
        <p className="mt-2">
          Collections are posts that aggregate all the information about
          specific news to help you save time and discuss with the community.
        </p>
      </div>
      <CloseButton
        buttonSize={ButtonSize.XSmall}
        onClick={() => completeAction(ActionType.CollectionsIntro)}
      />
    </span>
  );
}
