import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Tooltip } from '../tooltip/Tooltip';
import { chipsDocs } from '../../lib/constants';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { useAuthContext } from '../../contexts/AuthContext';

const CHIPS_CTA_ACCOUNTS_BEFORE = new Date('2026-06-01T00:00:00Z');

type NewStripCtaProps = {
  className?: string;
};

export const NewStripCta = ({
  className,
}: NewStripCtaProps): ReactElement | null => {
  const { user } = useAuthContext();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const isExistingAccount =
    !!user?.createdAt && new Date(user.createdAt) < CHIPS_CTA_ACCOUNTS_BEFORE;

  if (
    !isExistingAccount ||
    !isActionsFetched ||
    checkHasCompleted(ActionType.ClickedNewStripCta)
  ) {
    return null;
  }

  return (
    <Tooltip content="Learn how to customize and more!">
      <a
        href={chipsDocs}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          completeAction(ActionType.ClickedNewStripCta);
        }}
        className={classNames(
          'shadow-md inline-flex shrink-0 items-center bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default font-bold text-white typo-callout',
          className,
        )}
      >
        Want chips 🍟?
      </a>
    </Tooltip>
  );
};
