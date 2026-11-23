import type { ReactElement } from 'react';
import React from 'react';
import CloseButton from '../../CloseButton';
import { ButtonSize } from '../../buttons/common';
import { InfoIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useActions } from '../../../hooks/useActions';
import { ActionType } from '../../../graphql/actions';
import { anchorDefaultRel } from '../../../lib/strings';

const docsUrl = 'https://docs.daily.dev/what-the-feed-recommends/#ai-written';

export const AiWrittenWarning = (): ReactElement | null => {
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();

  if (
    !isActionsFetched ||
    checkHasCompleted(ActionType.DismissComposerAiWarning)
  ) {
    return null;
  }

  return (
    <div className="flex w-full shrink-0 items-center gap-2 bg-status-info/[0.1] py-1 pl-5 pr-3 text-text-secondary typo-caption1">
      <InfoIcon
        size={IconSize.Size16}
        secondary
        className="shrink-0 text-status-info"
      />
      <span className="min-w-0 flex-1">
        <strong className="font-bold text-text-primary">Tip:</strong>{' '}
        AI-generated posts get limited reach. Our community wants to read your
        stories in your own words.{' '}
        <a
          href={docsUrl}
          target="_blank"
          rel={anchorDefaultRel}
          className="font-bold text-text-primary underline"
        >
          Learn more
        </a>
      </span>
      <CloseButton
        type="button"
        size={ButtonSize.XSmall}
        className="shrink-0"
        onClick={() => completeAction(ActionType.DismissComposerAiWarning)}
        aria-label="Dismiss AI-generated posts tip"
      />
    </div>
  );
};
