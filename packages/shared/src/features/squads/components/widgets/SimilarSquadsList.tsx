import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import type { Squad } from '../../../../graphql/sources';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogExtraContextProvider } from '../../../../contexts/LogExtraContext';
import useLogEventOnce from '../../../../hooks/log/useLogEventOnce';
import { ImpressionStatus } from '../../../../hooks/feed/useLogImpression';
import type { ViewabilityData } from '../../../monetization/viewability';
import { viewabilityLogExtra } from '../../../monetization/viewability';
import { AdActions } from '../../../../lib/ads';
import { adLogEvent } from '../../../../lib/feed';
import { LogEvent, TargetType } from '../../../../lib/log';
import type { Origin } from '../../../../lib/log';
import { largeNumberFormat } from '../../../../lib/numberFormat';
import type { SquadAd } from '../../../../components/cards/ad/squad/SquadAdEntityCard';
import { SquadAdEntityCard } from '../../../../components/cards/ad/squad/SquadAdEntityCard';
import { SquadActionButton } from '../../../../components/squads/SquadActionButton';
import {
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { Separator } from '../../../../components/cards/common/common';
import { getSquadId } from '../../lib/features';
import { SquadRow } from './SquadRow';

interface SimilarSquadsListProps {
  /** The squad the list is similar to. */
  squadId: string;
  rows: Squad[];
  ad?: SquadAd;
  origin: Origin;
  promotedOrigin: Origin;
  /** Merged into the list's impression. */
  impressionExtra?: Record<string, unknown>;
  className?: string;
}

export const SimilarSquadsList = ({
  squadId,
  rows,
  ad,
  origin,
  promotedOrigin,
  impressionExtra,
  className,
}: SimilarSquadsListProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { ref: listRef, inView: isListInView } = useInView({
    triggerOnce: true,
  });
  const { ref: promotedRef, inView: isPromotedInView } = useInView({
    triggerOnce: true,
  });

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.SimilarSquads,
      target_id: squadId,
      extra: JSON.stringify({
        origin,
        squads: rows.map(({ id }) => id),
        promoted: ad?.data.source.id,
        ...impressionExtra,
      }),
    }),
    { condition: isListInView },
  );

  const onAdAction = useCallback(
    (action: AdActions, extra?: Record<string, unknown>) => {
      if (!ad) {
        return;
      }

      logEvent(
        adLogEvent(action, ad, {
          extra: { origin: promotedOrigin, ...extra },
        }),
      );
    },
    [logEvent, ad, promotedOrigin],
  );

  const onViewable = useCallback(
    (data: ViewabilityData) =>
      onAdAction(AdActions.Viewable, viewabilityLogExtra(data)),
    [onAdAction],
  );

  useEffect(() => {
    if (
      !ad ||
      !isPromotedInView ||
      ad.impressionStatus === ImpressionStatus.LOGGED
    ) {
      return;
    }

    onAdAction(AdActions.Impression);
    // Marked on the cached ad, so a remount doesn't log it again
    // eslint-disable-next-line no-param-reassign
    ad.impressionStatus = ImpressionStatus.LOGGED;
  }, [ad, isPromotedInView, onAdAction]);

  const onClickRow = (clicked: Squad, rowOrigin: Origin, position: number) =>
    logEvent({
      event_name: LogEvent.ClickSimilarSquad,
      target_type: TargetType.Source,
      target_id: getSquadId(clicked),
      extra: JSON.stringify({ origin: rowOrigin, squad: squadId, position }),
    });

  const offset = ad ? 1 : 0;

  return (
    <ul ref={listRef} className={classNames('flex flex-col', className)}>
      {ad && (
        <li ref={promotedRef}>
          <SquadAdEntityCard
            ad={ad}
            variant="row"
            origin={promotedOrigin}
            onClickAd={() => {
              onAdAction(AdActions.Click);
              onClickRow(ad.data.source, promotedOrigin, 0);
            }}
            onViewable={onViewable}
          />
        </li>
      )}
      {rows.map((row, index) => (
        <li key={row.id}>
          <LogExtraContextProvider selector={() => ({ origin })}>
            <SquadRow
              squad={row}
              details={
                <>
                  <span className="min-w-0 shrink truncate">@{row.handle}</span>
                  <Separator />
                  <span className="shrink-0">
                    {largeNumberFormat(row.membersCount)} members
                  </span>
                </>
              }
              action={
                <SquadActionButton
                  squad={row}
                  origin={origin}
                  size={ButtonSize.Small}
                  copy={{ join: 'Join' }}
                  buttonVariants={[
                    ButtonVariant.Secondary,
                    ButtonVariant.Subtle,
                  ]}
                  alwaysShow
                />
              }
              onClick={() => onClickRow(row, origin, index + offset)}
            />
          </LogExtraContextProvider>
        </li>
      ))}
    </ul>
  );
};
