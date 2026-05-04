import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import type { SearchSuggestion } from '../../../../graphql/search';
import { SearchProviderEnum } from '../../../../graphql/search';
import { useSearchProviderSuggestions } from '../../../../hooks/search';
import { LogEvent, Origin, TargetType } from '../../../../lib/log';
import { useLogContext } from '../../../../contexts/LogContext';
import { webappUrl } from '../../../../lib/constants';
import { Image } from '../../../image/Image';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { FollowButton } from '../../../contentPreference/FollowButton';
import { ContentPreferenceType } from '../../../../graphql/contentPreference';
import { CopyType } from '../../../sources/SourceActions/SourceActionsFollow';

interface SuggestionsListProps {
  query: string;
  title: string;
  className?: string;
  showFollow?: boolean;
}

const SuggestionRow = ({
  suggestion,
  onClick,
  imageRoundedClass,
  contentPreferenceType,
  showFollow,
}: {
  suggestion: SearchSuggestion;
  onClick: () => void;
  imageRoundedClass: string;
  contentPreferenceType: ContentPreferenceType;
  showFollow?: boolean;
}): ReactElement => {
  const feedSettingsEditContext = useContext(FeedSettingsEditContext);
  const feed = feedSettingsEditContext?.feed;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 overflow-hidden rounded-12 p-2 hover:bg-surface-float focus:bg-surface-float laptop:text-text-tertiary"
    >
      <Image
        loading="lazy"
        src={suggestion.image}
        alt={`${suggestion.title} logo`}
        className={classNames('size-7', imageRoundedClass)}
      />
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
          entityId={suggestion.id ?? ''}
          type={contentPreferenceType}
          status={suggestion.contentPreference?.status}
          entityName={`@${suggestion.subtitle}`}
          showSubscribe={false}
          copyType={CopyType.Custom}
        />
      )}
    </button>
  );
};

const SectionHeader = ({ title }: { title: string }): ReactElement => (
  <div className="relative my-2 flex items-center justify-start gap-2">
    <hr className="w-2 border-border-subtlest-tertiary" />
    <span className="relative inline-flex font-bold typo-footnote">
      {title}
    </span>
    <hr className="flex-1 border-border-subtlest-tertiary" />
  </div>
);

export const SourceSearchSuggestions = ({
  query,
  title,
  className,
  showFollow,
}: SuggestionsListProps): ReactElement | null => {
  const feedSettingsEditContext = useContext(FeedSettingsEditContext);
  const feed = feedSettingsEditContext?.feed;
  const router = useRouter();
  const { logEvent } = useLogContext();

  const { suggestions } = useSearchProviderSuggestions({
    provider: SearchProviderEnum.Sources,
    query,
    limit: 3,
    includeContentPreference: true,
    feedId: feed?.id,
  });

  if (!suggestions?.hits?.length) {
    return null;
  }

  const onSuggestionClick = (suggestion: SearchSuggestion) => {
    const source = suggestion.subtitle?.toLowerCase() || suggestion.id;
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.SearchRecommendation,
      target_id: source,
      feed_item_title: source,
      extra: JSON.stringify({
        origin: Origin.HomePage,
        provider: SearchProviderEnum.Sources,
      }),
    });
    router.push(`${webappUrl}sources/${source}`);
  };

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <SectionHeader title={title} />
      {suggestions.hits.map((suggestion) => (
        <SuggestionRow
          key={suggestion.title}
          suggestion={suggestion}
          showFollow={showFollow}
          imageRoundedClass="rounded-full"
          contentPreferenceType={ContentPreferenceType.Source}
          onClick={() => onSuggestionClick(suggestion)}
        />
      ))}
    </div>
  );
};

export const UserSearchSuggestions = ({
  query,
  title,
  className,
  showFollow,
}: SuggestionsListProps): ReactElement | null => {
  const feedSettingsEditContext = useContext(FeedSettingsEditContext);
  const feed = feedSettingsEditContext?.feed;
  const router = useRouter();
  const { logEvent } = useLogContext();

  const { suggestions } = useSearchProviderSuggestions({
    provider: SearchProviderEnum.Users,
    query,
    limit: 3,
    includeContentPreference: true,
    feedId: feed?.id,
  });

  if (!suggestions?.hits?.length) {
    return null;
  }

  const onSuggestionClick = (suggestion: SearchSuggestion) => {
    const user = suggestion.id || suggestion.subtitle?.toLowerCase() || '';
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
    router.push(`${webappUrl}${user}`);
  };

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <SectionHeader title={title} />
      {suggestions.hits.map((suggestion) => (
        <SuggestionRow
          key={suggestion.title}
          suggestion={suggestion}
          showFollow={showFollow}
          imageRoundedClass="rounded-8"
          contentPreferenceType={ContentPreferenceType.User}
          onClick={() => onSuggestionClick(suggestion)}
        />
      ))}
    </div>
  );
};
