import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import { Origin } from '../../../../lib/log';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import { getSquadId } from '../../lib/features';
import { useSimilarSquads } from '../../hooks/useSimilarSquads';
import { SquadWidget } from './SquadWidget';
import { SimilarSquadsList } from './SimilarSquadsList';

const MAX_ROWS = 5;
const TITLE = 'Similar squads';

const SimilarSquadsSkeleton = (): ReactElement => (
  <SquadWidget title={TITLE}>
    <div aria-busy className="mt-2 flex flex-col">
      {Array.from({ length: MAX_ROWS }, (_, index) => (
        <div key={index} className="flex items-center gap-3 py-2">
          <ElementPlaceholder className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1">
            <ElementPlaceholder className="h-4 w-32 rounded-8" />
            <ElementPlaceholder className="h-3 w-24 rounded-8" />
          </div>
        </div>
      ))}
    </div>
  </SquadWidget>
);

interface SimilarSquadsWidgetProps {
  squad: Squad;
}

export const SimilarSquadsWidget = ({
  squad,
}: SimilarSquadsWidgetProps): ReactElement | null => {
  const { canShow, isLoading, rows, ad } = useSimilarSquads({
    squad,
    maxRows: MAX_ROWS,
    adKey: 'similar-squads',
  });

  if (!canShow) {
    return null;
  }

  if (isLoading) {
    return <SimilarSquadsSkeleton />;
  }

  if (!rows.length) {
    return null;
  }

  return (
    <SquadWidget title={TITLE}>
      <SimilarSquadsList
        className="mt-2"
        squadId={getSquadId(squad)}
        rows={rows}
        ad={ad}
        origin={Origin.SimilarSquads}
        promotedOrigin={Origin.SimilarSquadsPromoted}
      />
    </SquadWidget>
  );
};
