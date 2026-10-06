import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import { Origin } from '../../../../lib/log';
import { useViewSize, ViewSize } from '../../../../hooks/useViewSize';
import { useSquadJoinSuggestion } from '../../hooks/useSquadJoinSuggestion';
import { SquadJoinSuggestions } from './SquadJoinSuggestions';

interface SquadJoinSuggestionsInlineProps {
  squad: Squad;
}

// Below laptop the right column hides behind the About tab, so a join from
// the header shows its suggestions right under it. From laptop the column's
// Similar squads already sits beside the feed.
export const SquadJoinSuggestionsInline = ({
  squad,
}: SquadJoinSuggestionsInlineProps): ReactElement | null => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { suggestion, closeSuggestion } = useSquadJoinSuggestion();

  if (
    isLaptop ||
    suggestion?.origin !== Origin.SquadPage ||
    suggestion.squad.id !== squad.id
  ) {
    return null;
  }

  return (
    <SquadJoinSuggestions
      suggestion={suggestion}
      onClose={closeSuggestion}
      className="mx-4 mb-4 tablet:mx-6"
    />
  );
};
