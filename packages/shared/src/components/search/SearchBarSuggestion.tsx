import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import classNames from 'classnames';
import {
  AllowedTags,
  Button,
  ButtonProps,
  ButtonVariant,
} from '../buttons/Button';
import { AiIcon } from '../icons';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { SearchProviderEnum, SearchQuestion } from '../../graphql/search';
import LogContext from '../../contexts/LogContext';

export type SuggestionOrigin =
  | Origin.HomePage
  | Origin.SearchPage
  | Origin.HistoryPage;

type SearchBarSuggestionProps = ButtonProps<AllowedTags> & {
  id: SearchQuestion['id'];
  prompt: SearchQuestion['question'];
  origin: SuggestionOrigin;
  isHistory?: boolean;
};

export const SearchBarSuggestion = ({
  className,
  origin,
  id: suggestionId,
  isHistory,
  prompt,
  children,
  ...props
}: SearchBarSuggestionProps): ReactElement => {
  const { logEvent } = useContext(LogContext);
  const impressionEmitted = useRef(false);

  useEffect(() => {
    if (!isHistory && suggestionId && !impressionEmitted.current) {
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.SearchRecommendation,
        target_id: suggestionId,
        feed_item_title: prompt,
        extra: JSON.stringify({ origin }),
      });

      impressionEmitted.current = true;
    }

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestionId, isHistory]);

  const handleSuggestionsClick = useCallback(() => {
    if (suggestionId) {
      logEvent({
        event_name: LogEvent.Click,
        target_type: isHistory
          ? TargetType.SearchHistory
          : TargetType.SearchRecommendation,
        target_id: suggestionId,
        feed_item_title: prompt,
        extra: JSON.stringify({ origin, provider: SearchProviderEnum.Chat }),
      });
    }
  }, [origin, suggestionId, prompt, logEvent, isHistory]);

  return (
    <Button
      icon={<AiIcon />}
      variant={ButtonVariant.Subtle}
      className={classNames('w-fit !justify-start typo-subhead', className)}
      onClick={handleSuggestionsClick}
      {...props}
    >
      <span className="line-clamp-1 w-fit">{children}</span>
    </Button>
  );
};
