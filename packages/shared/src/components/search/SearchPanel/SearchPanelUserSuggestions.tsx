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
import {
  FeedSettingsEditContext,
  useFeedSettingsEditContext,
} from '../../feeds/FeedSettings/FeedSettingsEditContext';
import { FollowButton } from '../../contentPreference/FollowButton';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import { CopyType } from '../../sources/SourceActions/SourceActionsFollow';

export type SearchPanelUserSuggestionsProps = {
  className?: string;
  showFollow?: boolean;
  title: string;
};

type PanelItemProps = Pick<ButtonProps<'a'>, 'onClick'> & {
  showFollow?: boolean;
  suggestion: SearchSuggestion;
};

const PanelItem = ({ suggestion, showFollow, ...rest }: PanelItemProps) => {
  const feedSettingsEditContext = useFeedSettingsEditContext();
  const feed = feedSettingsEditContext?.feed;
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
      <div className="flex flex-1 flex-col items-start">
        <span className="flex-shrink overflow-hidden overflow-ellipsis whitespace-nowrap font-bold text-text-primary typo-subhead">
          {suggestion.title}
        </span>
        <span className="text-text-quarternary typo-footnote">
          @{suggestion.subtitle}
        </span>
      </div>
      {!!showFollow && (
        <FollowButton
          feedId={feed?.id}
          entityId={suggestion.id}
          type={ContentPreferenceType.User}
          status={suggestion.contentPreference?.status}
          entityName={`@${suggestion.subtitle}`}
          showSubscribe={false}
          copyType={CopyType.Custom}
        />
      )}
    </SearchPanelItem>
  );
};

export const SearchPanelUserSuggestions = ({
  className,
  title,
  showFollow,
}: SearchPanelUserSuggestionsProps): ReactElement => {
  const feedSettingsEditContext = useContext(FeedSettingsEditContext);
  const feed = feedSettingsEditContext?.feed;
  const router = useRouter();
  const { logEvent } = useContext(LogContext);
  const searchPanel = useContext(SearchPanelContext);

  const { suggestions } = useSearchProviderSuggestions({
    provider: SearchProviderEnum.Users,
    query: searchPanel.query,
    limit: 3,
    includeContentPreference: true,
    feedId: feed?.id,
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
            showFollow={showFollow}
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
