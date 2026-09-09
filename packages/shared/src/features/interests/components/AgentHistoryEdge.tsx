import type { ReactElement } from 'react';
import React from 'react';
import { FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { useAgent } from '../AgentContext';

export const AgentHistoryEdge = (): ReactElement | null => {
  const { isHistoryLimited, isOldRunView, showEarlier, leaveRunView } =
    useAgent();

  if (isOldRunView) {
    return (
      <FlexRow className="justify-center">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Subtle}
          onClick={leaveRunView}
        >
          Load latest run
        </Button>
      </FlexRow>
    );
  }

  if (!isHistoryLimited) {
    return null;
  }

  return (
    <FlexRow className="justify-center">
      <Button
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Subtle}
        onClick={showEarlier}
      >
        Show earlier activity
      </Button>
    </FlexRow>
  );
};
