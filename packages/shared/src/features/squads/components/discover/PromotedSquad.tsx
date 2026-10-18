import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Ad } from '../../../../graphql/posts';
import { LogExtraContextProvider } from '../../../../contexts/LogExtraContext';
import { AdPixel } from '../../../../components/cards/ad/common/AdPixel';
import { AdViewability } from '../../../../components/cards/ad/common/AdViewability';
import { useSquadsDirectoryLogging } from '../../../../components/cards/squad/common/useSquadsDirectoryLogging';
import { useScrambler } from '../../../../hooks/useScrambler';
import { TargetType } from '../../../../lib/log';

// A join inside a promoted card carries the campaign's generation id.
const PromotedSquadLogExtra = ({
  ad,
  children,
}: {
  ad: Ad;
  children: ReactNode;
}): ReactElement => (
  <LogExtraContextProvider
    selector={() => {
      const extraData: Record<string, unknown> = {};

      if (ad.data?.source) {
        const { source } = ad.data;

        extraData.referrer_target_id = source.id;
        extraData.referrer_target_type = source.id
          ? TargetType.Source
          : undefined;
      }

      if (ad.generationId) {
        extraData.gen_id = ad.generationId;
      }

      return extraData;
    }}
  >
    {children}
  </LogExtraContextProvider>
);

interface PromotedSquadTracking {
  ref?: (node?: Element | null) => void;
  onClickAd?: () => void;
  /** Placed inside the card, which the viewability tracker stretches over. */
  trackers?: ReactNode;
}

interface PromotedSquadProps {
  ad?: Ad;
  /** Share of the card on screen before the impression counts. */
  impressionThreshold?: number;
  children: (tracking: PromotedSquadTracking) => ReactNode;
}

// Every discovery card can take a promoted slot: the same card as an organic
// squad, plus the campaign's impression, viewability, click and pixel.
export const PromotedSquad = ({
  ad,
  impressionThreshold,
  children,
}: PromotedSquadProps): ReactElement => {
  const { ref, onClickAd, onViewableAd } = useSquadsDirectoryLogging(
    ad,
    impressionThreshold,
  );

  if (!ad) {
    return <>{children({})}</>;
  }

  return (
    <PromotedSquadLogExtra ad={ad}>
      {children({
        ref,
        onClickAd,
        trackers: (
          <>
            <AdViewability ad={ad} onViewable={onViewableAd} />
            {!!ad.pixel && <AdPixel pixel={ad.pixel} />}
          </>
        ),
      })}
    </PromotedSquadLogExtra>
  );
};

// The disclosure opens the meta line in its own colour, never in a tooltip.
export const PromotedLabel = (): ReactElement => {
  const copy = useScrambler('Promoted');

  return <strong>{copy}</strong>;
};
