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
  ButtonSize,
} from '../buttons/Button';
import { AiIcon } from '../icons';
import { AnalyticsEvent, Origin, TargetType } from '../../lib/analytics';
import { SearchQuestion } from '../../graphql/search';
import AnalyticsContext from '../../contexts/AnalyticsContext';

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
  ...props
}: SearchBarSuggestionProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const impressionEmitted = useRef(false);

  useEffect(() => {
    if (!isHistory && suggestionId && !impressionEmitted.current) {
      trackEvent({
        event_name: AnalyticsEvent.Impression,
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
      trackEvent({
        event_name: AnalyticsEvent.Click,
        target_type: isHistory
          ? TargetType.SearchHistory
          : TargetType.SearchRecommendation,
        target_id: suggestionId,
        feed_item_title: prompt,
        extra: JSON.stringify({ origin }),
      });
    }
  }, [origin, suggestionId, prompt, trackEvent, isHistory]);

  return (
    <Button
      spanClassName="w-fit my-2 flex-shrink tablet:line-clamp-1"
      textPosition="justify-start"
      icon={<AiIcon />}
      buttonSize={ButtonSize.Medium}
      className={classNames(
        'btn-secondary !h-auto min-h-[2.5rem] w-fit border-theme-divider-tertiary text-theme-label-tertiary typo-subhead',
        className,
      )}
      onClick={handleSuggestionsClick}
      {...props}
    />
  );
};
