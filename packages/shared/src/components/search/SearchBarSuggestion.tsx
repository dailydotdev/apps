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
import { SearchSession } from '../../graphql/search';
import AnalyticsContext from '../../contexts/AnalyticsContext';

export type SuggestionOrigin =
  | Origin.HomePage
  | Origin.HistoryTooltip
  | Origin.HistoryPage;
type SearchBarSuggestionProps = ButtonProps<AllowedTags> & {
  suggestion?: Partial<SearchSession>;
  origin?: SuggestionOrigin;
};

export const SearchBarSuggestion = ({
  className,
  origin,
  ...props
}: SearchBarSuggestionProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);

  useEffect(() => {
    if (props.suggestion?.id) {
      trackEvent({
        event_name: AnalyticsEvent.Impression,
        target_type: TargetType.SearchRecommendation,
        target_id: props.suggestion.id,
        feed_item_title: props.suggestion.prompt,
        extra: JSON.stringify({ origin }),
      });
    }

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.suggestion?.id]);

  const handleSuggestionsClick = useCallback(() => {
    trackEvent({
      event_name: AnalyticsEvent.Click,
      target_type: TargetType.SearchRecommendation,
      target_id: props.suggestion?.id,
      feed_item_title: props.suggestion?.prompt,
      extra: JSON.stringify({ origin }),
    });
  }, [origin, props.suggestion, trackEvent]);

  return (
    <Button
      spanClassName="w-fit py-2 flex-shrink"
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
