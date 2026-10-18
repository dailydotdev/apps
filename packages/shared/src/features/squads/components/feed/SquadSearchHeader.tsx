import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { MiniCloseIcon, MoveToIcon } from '../../../../components/icons';
import { SquadImage } from '../../../../components/squads/SquadImage';
import { useSpotlight } from '../../../../components/spotlight/SpotlightContext';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadSpotlightSource } from '../../lib/spotlight';

interface SquadSearchHeaderProps {
  query: string;
  onClear: () => void;
}

// The page gives way to the results under a back button and the query, the
// way a profile answers a search. The query text reopens Spotlight to edit it.
export const SquadSearchHeader = ({
  query,
  onClear,
}: SquadSearchHeaderProps): ReactElement => {
  const { squad } = useSquadPageContext();
  const { openWithSource } = useSpotlight();

  return (
    <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-4 py-3">
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<MoveToIcon className="rotate-180" />}
        aria-label={`Back to ${squad.name}`}
        onClick={onClear}
      />
      <span className="flex h-8 min-w-0 items-center rounded-10 bg-surface-float pr-1 text-text-primary">
        <button
          type="button"
          title="Edit search"
          onClick={() =>
            openWithSource(getSquadSpotlightSource(squad), { query })
          }
          className="flex h-full min-w-0 items-center gap-2 pl-2 pr-1 typo-callout"
        >
          <SquadImage {...squad} className="size-5 shrink-0" />
          <span className="truncate">{query}</span>
        </button>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          icon={<MiniCloseIcon />}
          aria-label="Clear search"
          onClick={onClear}
        />
      </span>
    </div>
  );
};
