import React, { ReactElement, useCallback, useContext, useEffect } from 'react';
import classNames from 'classnames';
import {
  AllowedTags,
  Button,
  ButtonProps,
  ButtonSize,
} from '../buttons/Button';
import { AiIcon } from '../icons';
import { AnalyticsEvent, Origin, TargetType } from '../../lib/analytics';
import { SearchQuestion, SearchSession } from '../../graphql/search';
import AnalyticsContext from '../../contexts/AnalyticsContext';

export type SuggestionOrigin = Origin.HomePage | Origin.SearchPage;

type SearchBarSuggestionProps = ButtonProps<AllowedTags> & {
  suggestion?: Partial<SearchQuestion | SearchSession>;
  origin?: SuggestionOrigin;
  isHistory?: boolean;
};

export const SearchBarSuggestion = ({
  className,
  origin,
  ...props
}: SearchBarSuggestionProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);

  useEffect(() => {
    const suggestion = props.suggestion as SearchQuestion;

    if (!props.isHistory && suggestion?.id) {
      trackEvent({
        event_name: AnalyticsEvent.Impression,
        target_type: TargetType.SearchRecommendation,
        target_id: suggestion.id,
        feed_item_title: suggestion.question,
        extra: JSON.stringify({ origin }),
      });
    }

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuggestionsClick = useCallback(() => {
    const session = props.suggestion as SearchSession;
    const suggestion = props.suggestion as SearchQuestion;

    if (suggestion?.id || session?.sessionId) {
      trackEvent({
        event_name: AnalyticsEvent.Click,
        target_type: props.isHistory
          ? TargetType.SearchHistory
          : TargetType.SearchRecommendation,
        target_id: props.isHistory ? session.sessionId : suggestion.id,
        feed_item_title: props.isHistory ? session.prompt : suggestion.question,
        extra: JSON.stringify({ origin }),
      });
    }
  }, [origin, props.suggestion, trackEvent, props.isHistory]);

  return (
    <Button
      spanClassName="w-fit my-2 flex-shrink tablet:line-clamp-1"
      textPosition="justify-start"
      icon={<AiIcon />}
      buttonSize={ButtonSize.XLarge}
      className={classNames(
        'btn-secondary border-theme-divider-tertiary typo-subhead text-theme-label-tertiary w-fit !h-auto min-h-[2.5rem]',
        className,
      )}
      onClick={handleSuggestionsClick}
      {...props}
    />
  );
};
