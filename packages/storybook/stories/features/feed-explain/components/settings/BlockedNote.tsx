import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PanelCard } from '../panel/Section';

/** One line where a list used to be, pointing at the page that owns it. */
export const BlockedNote = ({
  text,
  onOpen,
}: {
  text: string;
  onOpen: () => void;
}): ReactElement => (
  <PanelCard className="flex flex-wrap items-center gap-3 p-4">
    <span className="min-w-0 flex-[1_1_16rem] text-text-tertiary typo-footnote">
      {text}
    </span>
    <Button
      type="button"
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      onClick={onOpen}
    >
      Manage in Filters
    </Button>
  </PanelCard>
);
