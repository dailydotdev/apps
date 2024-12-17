import React, { ReactElement } from 'react';
import { UserShortInfoPlaceholder } from './UserShortInfoPlaceholder';
import InfiniteScrolling, {
  InfiniteScrollingProps,
} from '../containers/InfiniteScrolling';
import { Source, SourceType } from '../../graphql/sources';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Separator } from '../cards/common/common';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { FollowButton } from '../contentPreference/FollowButton';
import { useFeedSettingsEditContext } from '../feeds/FeedSettings/FeedSettingsEditContext';
import { CopyType } from '../sources/SourceActions/SourceActionsFollow';

export interface SourceListProps {
  scrollingProps: Omit<InfiniteScrollingProps, 'children'>;
  sources: Source[];
  placeholderAmount?: number;
  isLoading?: boolean;
  emptyPlaceholder?: JSX.Element;
}

export const SourceList = ({
  placeholderAmount,
  scrollingProps,
  sources,
  isLoading,
  emptyPlaceholder,
}: SourceListProps): ReactElement => {
  const { feed } = useFeedSettingsEditContext();
  const loader = (
    <UserShortInfoPlaceholder placeholderAmount={placeholderAmount} />
  );

  if (sources?.length) {
    return (
      <InfiniteScrolling
        {...scrollingProps}
        aria-label="source-list"
        placeholder={loader}
      >
        {sources.map((source) => (
          <div key={source.id} className="flex gap-2">
            <ProfilePicture
              size={ProfileImageSize.Large}
              rounded="full"
              className="mt-2"
              user={{
                id: source.id,
                image: source.image,
                username: source.handle,
              }}
              nativeLazyLoading
            />
            <div className="flex-1">
              <Typography
                type={TypographyType.Callout}
                bold
                color={TypographyColor.Primary}
              >
                {source.name}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Secondary}
              >
                {source.handle}
                {source.type === SourceType.Squad && (
                  <>
                    <Separator />
                    <Typography
                      tag={TypographyTag.Span}
                      type={TypographyType.Footnote}
                      color={TypographyColor.Brand}
                    >
                      Squad
                    </Typography>
                  </>
                )}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="multi-truncate line-clamp-2"
              >
                {source.description}
              </Typography>
            </div>
            <FollowButton
              feedId={feed?.id}
              entityId={source.id}
              type={ContentPreferenceType.Source}
              status={ContentPreferenceStatus.Follow}
              entityName={`@${source.handle}`}
              showSubscribe={false}
              copyType={CopyType.Custom}
            />
          </div>
        ))}
      </InfiniteScrolling>
    );
  }

  if (isLoading) {
    return loader;
  }

  return emptyPlaceholder ?? loader;
};
