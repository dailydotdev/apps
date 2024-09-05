import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { ActionType } from '../../../graphql/actions';
import { useActions } from '../../../hooks';
import { ButtonSize } from '../../buttons/Button';
import CloseButton from '../../CloseButton';

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
        'relative flex w-full flex-row rounded-10 border border-accent-cabbage-default p-3 pr-2',
        className,
      )}
    >
      <div className="flex flex-1 flex-col typo-subhead">
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
