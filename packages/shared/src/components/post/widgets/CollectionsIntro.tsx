import React, { ReactElement } from 'react';
import classNames from 'classnames';
import CloseButton from '../../CloseButton';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { ButtonSize } from '../../buttons/ButtonV2';

export type CollectionsIntroProps = {
  className?: string;
};

export const CollectionsIntro = ({
  className,
}: CollectionsIntroProps): ReactElement => {
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();

  if (!isActionsFetched || checkHasCompleted(ActionType.CollectionsIntro)) {
    return null;
  }

  return (
    <span
      className={classNames(
        'flex relative flex-row p-3 pr-2 w-full rounded-10 border border-theme-color-cabbage',
        className,
      )}
    >
      <div className="flex flex-col flex-1 typo-subhead">
        <strong>Introducing collections!</strong>
        <p className="mt-2">
          Collections are posts that aggregate all the information about
          specific news to help you save time and discuss with the community.
        </p>
      </div>
      <CloseButton
        size={ButtonSize.XSmall}
        onClick={() => completeAction(ActionType.CollectionsIntro)}
      />
    </span>
  );
};
