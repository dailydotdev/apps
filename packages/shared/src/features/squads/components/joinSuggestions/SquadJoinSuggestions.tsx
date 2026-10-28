import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../../contexts/LogContext';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { LogEvent, Origin, TargetType } from '../../../../lib/log';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import CloseButton from '../../../../components/CloseButton';
import { ButtonSize } from '../../../../components/buttons/Button';
import { getSquadId } from '../../lib/features';
import type { SquadJoinSuggestion } from '../../lib/joinSuggestions';
import {
  markSquadJoinSuggestionsShown,
  muteSquadJoinSuggestions,
} from '../../lib/joinSuggestions';
import { useSimilarSquads } from '../../hooks/useSimilarSquads';
import { SimilarSquadsList } from '../widgets/SimilarSquadsList';

const MAX_ROWS = 3;
// A promoted row with a single organic one under it reads as an ad
const MIN_ORGANIC_ROWS = 2;

interface SquadJoinSuggestionsProps {
  suggestion: SquadJoinSuggestion;
  onClose: () => void;
  className?: string;
}

export const SquadJoinSuggestions = ({
  suggestion,
  onClose,
  className,
}: SquadJoinSuggestionsProps): ReactElement | null => {
  const { squad, origin: trigger } = suggestion;
  const squadId = getSquadId(squad);
  const { logEvent } = useLogContext();
  const { dismissToast } = useToastNotification();
  const { canShow, isLoading, rows, ad } = useSimilarSquads({
    squad,
    maxRows: MAX_ROWS,
    adKey: 'squad-join-suggestions',
  });
  const isShown = canShow && !isLoading && rows.length >= MIN_ORGANIC_ROWS;
  const isEmpty = !canShow || (!isLoading && !isShown);
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (isEmpty) {
      onClose();
    }
  }, [isEmpty, onClose]);

  useEffect(() => {
    if (!isShown || hasShownRef.current) {
      return;
    }

    hasShownRef.current = true;
    markSquadJoinSuggestionsShown();
    // The card confirms the join, so a "You joined" toast would only cover it
    dismissToast();
  }, [isShown, dismissToast]);

  if (!isShown) {
    return null;
  }

  const onDismiss = () => {
    logEvent({
      event_name: LogEvent.DismissSquadJoinSuggestions,
      target_type: TargetType.SimilarSquads,
      target_id: squadId,
      extra: JSON.stringify({ origin: Origin.SquadJoinSuggestions, trigger }),
    });
    muteSquadJoinSuggestions();
    onClose();
  };

  return (
    <section
      aria-label={`Squads like ${squad.name}`}
      className={classNames(
        'flex animate-composer-in flex-col rounded-16 border border-border-subtlest-tertiary p-4',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Callout}
            bold
            truncate
          >
            You joined {squad.name}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            You might also like these squads
          </Typography>
        </div>
        <CloseButton
          size={ButtonSize.XSmall}
          aria-label="Dismiss suggested squads"
          onClick={onDismiss}
        />
      </div>
      <SimilarSquadsList
        className="mt-2"
        squadId={squadId}
        rows={rows}
        ad={ad}
        origin={Origin.SquadJoinSuggestions}
        promotedOrigin={Origin.SquadJoinSuggestionsPromoted}
        impressionExtra={{ trigger }}
      />
    </section>
  );
};
