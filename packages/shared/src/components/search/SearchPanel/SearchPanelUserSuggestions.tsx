import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import { useRouter } from 'next/router';
import { SearchProviderEnum, SearchSuggestion } from '../../../graphql/search';
import { useSearchProviderSuggestions } from '../../../hooks/search';
import { SearchPanelContext } from './SearchPanelContext';
import { useSearchPanelAction } from './useSearchPanelAction';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import LogContext from '../../../contexts/LogContext';
import { webappUrl } from '../../../lib/constants';
import { ButtonProps } from '../../buttons/Button';
import { SearchPanelItem } from './SearchPanelItem';
import { Image } from '../../image/Image';

export type SearchPanelUserSuggestionsProps = {
  className?: string;
  title: string;
};

type PanelItemProps = Pick<ButtonProps<'a'>, 'onClick'> & {
  suggestion: SearchSuggestion;
};

const PanelItem = ({ suggestion, ...rest }: PanelItemProps) => {
  const Icon = () => (
    <Image
      loading="lazy"
      src={suggestion.image}
      alt={`${suggestion.title} logo`}
      className="size-7 rounded-8"
    />
  );

  const itemProps = useSearchPanelAction({
    provider: SearchProviderEnum.Users,
    text: suggestion.title,
    icon: <Icon />,
  });

  return (
    <SearchPanelItem
      icon={<Icon />}
      {...itemProps}
      {...rest}
      className="px-2 py-1"
    >
      <div className="flex w-full flex-col items-start">
        <span className="flex-shrink overflow-hidden overflow-ellipsis whitespace-nowrap font-bold text-text-primary typo-subhead">
          {suggestion.title}
        </span>
        <span className="text-text-quarternary typo-footnote">
          @{suggestion.subtitle}
        </span>
      </div>
    </SearchPanelItem>
  );
};

export const SearchPanelUserSuggestions = ({
  className,
  title,
}: SearchPanelUserSuggestionsProps): ReactElement => {
  const router = useRouter();
  const { logEvent } = useContext(LogContext);
  const searchPanel = useContext(SearchPanelContext);

  const { suggestions } = useSearchProviderSuggestions({
    provider: SearchProviderEnum.Users,
    query: searchPanel.query,
    limit: 3,
  });

  const onSuggestionClick = (suggestion: SearchSuggestion) => {
    const user = suggestion.id || suggestion.subtitle.toLowerCase();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.SearchRecommendation,
      target_id: user,
      feed_item_title: user,
      extra: JSON.stringify({
        origin: Origin.HomePage,
        provider: SearchProviderEnum.Users,
      }),
    });

    router.push(`${webappUrl}/${user}`);
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
      {suggestions?.hits?.map((suggestion) => {
        return (
          <PanelItem
            key={suggestion.title}
            suggestion={suggestion}
            onClick={() => {
              onSuggestionClick(suggestion);
            }}
          />
        );
      })}
    </div>
  );
};
