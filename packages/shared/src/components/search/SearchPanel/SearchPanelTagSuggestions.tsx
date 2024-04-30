import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import { useRouter } from 'next/router';
import { SearchProviderEnum, SearchSuggestion } from '../../../graphql/search';
import { useSearchProviderSuggestions } from '../../../hooks/search';
import { SearchPanelContext } from './SearchPanelContext';
import { useSearchPanelAction } from './useSearchPanelAction';
import { AnalyticsEvent, Origin, TargetType } from '../../../lib/analytics';
import AnalyticsContext from '../../../contexts/AnalyticsContext';
import { SearchPanelItemContainer } from './SearchPanelInputContainer';
import { TagLink } from '../../TagLinks';
import { webappUrl } from '../../../lib/constants';
import { ButtonProps } from '../../buttons/Button';

export type SearchPanelTagSuggestionsProps = {
  className?: string;
  title: string;
};

const PanelItem = ({
  suggestion,
  onClick,
}: Pick<ButtonProps<'a'>, 'onClick'> & {
  suggestion: SearchSuggestion;
}) => {
  const itemProps = useSearchPanelAction({
    provider: SearchProviderEnum.Tags,
    text: suggestion.title,
  });

  return (
    <SearchPanelItemContainer {...itemProps} onClick={onClick}>
      <TagLink
        key={suggestion.id}
        tag={suggestion.id}
        buttonProps={{
          onClick: (event) => {
            event.preventDefault();
          },
        }}
      />
    </SearchPanelItemContainer>
  );
};

export const SearchPanelTagSuggestions = ({
  className,
  title,
}: SearchPanelTagSuggestionsProps): ReactElement => {
  const router = useRouter();
  const { trackEvent } = useContext(AnalyticsContext);
  const searchPanel = useContext(SearchPanelContext);

  const { suggestions } = useSearchProviderSuggestions({
    provider: SearchProviderEnum.Tags,
    query: searchPanel.query,
  });

  const onSuggestionClick = (suggestion: SearchSuggestion) => {
    const tag = suggestion.id || suggestion.title.toLowerCase();

    trackEvent({
      event_name: AnalyticsEvent.Click,
      target_type: TargetType.SearchRecommendation,
      target_id: tag,
      feed_item_title: tag,
      extra: JSON.stringify({
        origin: Origin.HomePage,
        provider: SearchProviderEnum.Tags,
      }),
    });

    router.push(`${webappUrl}tags/${tag}`);
  };

  if (!suggestions?.hits?.length) {
    return null;
  }

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <div className="relative my-2 flex items-center justify-start gap-2">
        <hr className="w-2 border-border-subtlest-tertiary" />
        <span className="relative inline-flex font-bold typo-footnote">
          {title}
        </span>
        <hr className="flex-1 border-border-subtlest-tertiary" />
      </div>
      <div className="flex-start flex gap-2 p-2">
        {suggestions?.hits?.map((suggestion) => {
          return (
            <PanelItem
              key={suggestion.title}
              suggestion={suggestion}
              onClick={(event) => {
                event.preventDefault();

                onSuggestionClick(suggestion);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
