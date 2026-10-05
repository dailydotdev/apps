import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import type { Squad } from '../../../../graphql/sources';
import { similarSquadsQueryOptions } from '../../../../graphql/squads';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogExtraContextProvider } from '../../../../contexts/LogExtraContext';
import { usePlusSubscription } from '../../../../hooks/usePlusSubscription';
import { useSquad } from '../../../../hooks/squads/useSquad';
import useLogEventOnce from '../../../../hooks/log/useLogEventOnce';
import { ImpressionStatus } from '../../../../hooks/feed/useLogImpression';
import { useAdQuery } from '../../../monetization/useAdQuery';
import type { ViewabilityData } from '../../../monetization/viewability';
import { viewabilityLogExtra } from '../../../monetization/viewability';
import {
  AdActions,
  AdPlacement,
  shouldSkipSourceAds,
} from '../../../../lib/ads';
import { adLogEvent } from '../../../../lib/feed';
import { LogEvent, Origin, TargetType } from '../../../../lib/log';
import { generateQueryKey, RequestKey, StaleTime } from '../../../../lib/query';
import { largeNumberFormat } from '../../../../lib/numberFormat';
import type { SquadAd } from '../../../../components/cards/ad/squad/SquadAdEntityCard';
import {
  isSquadAd,
  SquadAdEntityCard,
} from '../../../../components/cards/ad/squad/SquadAdEntityCard';
import { SquadActionButton } from '../../../../components/squads/SquadActionButton';
import {
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import { Separator } from '../../../../components/cards/common/common';
import { getSquadId } from '../../lib/features';
import { SquadWidget } from './SquadWidget';
import { SquadRow } from './SquadRow';

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
  const { user, isAuthReady, squads } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const squadId = getSquadId(squad);
  // Ad-free squads get no widget, and a squad still loading its features
  // could be one. Private squads have no similar squads to list.
  const canShow = squad.public && !shouldSkipSourceAds(squad);
  const isEnabled = canShow && isAuthReady;
  const canPromote = isEnabled && !isPlus;
  const { ref: listRef, inView: isListInView } = useInView({
    triggerOnce: true,
  });
  const { ref: promotedRef, inView: isPromotedInView } = useInView({
    triggerOnce: true,
  });

  const { data: similarSquads, isPending } = useQuery({
    ...similarSquadsQueryOptions({ squadId, user, limit: MAX_ROWS }),
    enabled: isEnabled,
  });
  const { data: ad, isPending: isAdPending } = useAdQuery({
    placement: AdPlacement.SquadDirectory,
    queryKey: generateQueryKey(RequestKey.Ads, user, 'similar-squads', squadId),
    enabled: canPromote,
    staleTime: StaleTime.OneHour,
    // A blocked ad request must not hold the organic rows behind retries
    retry: false,
  });
  const squadAd = canPromote && isSquadAd(ad) ? ad : undefined;
  const { squad: boostedSquad, isLoading: isBoostedSquadLoading } = useSquad({
    handle: squadAd?.data.source.handle ?? '',
  });
  // The ad server can't leave out the squad on the page or the reader's own
  // squads yet, so those boosts give their slot back to an organic row
  const eligibleAd =
    squadAd &&
    boostedSquad &&
    boostedSquad.id !== squadId &&
    !boostedSquad.currentMember
      ? squadAd
      : undefined;
  const isSlotPending =
    !isAuthReady ||
    isPending ||
    (canPromote && (isAdPending || isBoostedSquadLoading));
  // Decided once, so joining the promoted squad doesn't take its row away
  const [slot, setSlot] = useState<{ ad?: SquadAd }>();
  const isLoading = !slot;
  const promotedAd = canPromote ? slot?.ad : undefined;

  useEffect(() => {
    if (!slot && !isSlotPending) {
      setSlot({ ad: eligibleAd });
    }
  }, [slot, isSlotPending, eligibleAd]);

  const rows = useMemo(
    () =>
      (similarSquads ?? [])
        .filter(({ id }) => id !== promotedAd?.data.source.id)
        .slice(0, promotedAd ? MAX_ROWS - 1 : MAX_ROWS)
        .map((similarSquad) => ({
          ...similarSquad,
          // boot squads follow joins and leaves made from the rows
          currentMember: squads?.find(({ id }) => id === similarSquad.id)
            ?.currentMember,
        })),
    [similarSquads, promotedAd, squads],
  );
  const shownAd = !isLoading && rows.length ? promotedAd : undefined;

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.SimilarSquads,
      target_id: squadId,
      extra: JSON.stringify({
        squads: rows.map(({ id }) => id),
        promoted: shownAd?.data.source.id,
      }),
    }),
    { condition: !isLoading && !!rows.length && isListInView },
  );

  const onAdAction = useCallback(
    (action: AdActions, extra?: Record<string, unknown>) => {
      if (!shownAd) {
        return;
      }

      logEvent(
        adLogEvent(action, shownAd, {
          extra: { origin: Origin.SimilarSquadsPromoted, ...extra },
        }),
      );
    },
    [logEvent, shownAd],
  );

  const onViewable = useCallback(
    (data: ViewabilityData) =>
      onAdAction(AdActions.Viewable, viewabilityLogExtra(data)),
    [onAdAction],
  );

  useEffect(() => {
    if (
      !shownAd ||
      !isPromotedInView ||
      shownAd.impressionStatus === ImpressionStatus.LOGGED
    ) {
      return;
    }

    onAdAction(AdActions.Impression);
    shownAd.impressionStatus = ImpressionStatus.LOGGED;
  }, [shownAd, isPromotedInView, onAdAction]);

  const onClickRow = (clicked: Squad, origin: Origin, position: number) =>
    logEvent({
      event_name: LogEvent.ClickSimilarSquad,
      target_type: TargetType.Source,
      target_id: getSquadId(clicked),
      extra: JSON.stringify({ origin, squad: squadId, position }),
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

  const offset = shownAd ? 1 : 0;

  return (
    <SquadWidget title={TITLE}>
      <ul ref={listRef} className="mt-2 flex flex-col">
        {shownAd && (
          <li ref={promotedRef}>
            <SquadAdEntityCard
              ad={shownAd}
              variant="row"
              origin={Origin.SimilarSquadsPromoted}
              onClickAd={() => {
                onAdAction(AdActions.Click);
                onClickRow(
                  shownAd.data.source,
                  Origin.SimilarSquadsPromoted,
                  0,
                );
              }}
              onViewable={onViewable}
            />
          </li>
        )}
        {rows.map((row, index) => (
          <li key={row.id}>
            <LogExtraContextProvider
              selector={() => ({ origin: Origin.SimilarSquads })}
            >
              <SquadRow
                squad={row}
                details={
                  <>
                    <span className="min-w-0 shrink truncate">
                      @{row.handle}
                    </span>
                    <Separator />
                    <span className="shrink-0">
                      {largeNumberFormat(row.membersCount)} members
                    </span>
                  </>
                }
                action={
                  <SquadActionButton
                    squad={row}
                    origin={Origin.SimilarSquads}
                    size={ButtonSize.Small}
                    copy={{ join: 'Join' }}
                    buttonVariants={[
                      ButtonVariant.Secondary,
                      ButtonVariant.Subtle,
                    ]}
                    alwaysShow
                  />
                }
                onClick={() =>
                  onClickRow(row, Origin.SimilarSquads, index + offset)
                }
              />
            </LogExtraContextProvider>
          </li>
        ))}
      </ul>
    </SquadWidget>
  );
};
