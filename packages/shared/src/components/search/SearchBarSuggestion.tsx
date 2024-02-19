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
} from '../buttons/ButtonV2';
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
      icon={<AiIcon />}
      variant={ButtonVariant.Subtle}
      className={classNames(
        'my-2 !h-auto min-h-[2.5rem] w-fit flex-shrink justify-start typo-subhead tablet:line-clamp-1',
        className,
      )}
      onClick={handleSuggestionsClick}
      {...props}
    />
  );
};
