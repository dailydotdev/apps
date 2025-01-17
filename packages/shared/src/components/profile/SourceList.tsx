import type { ReactElement } from 'react';
import React from 'react';
import type { InfiniteScrollingProps } from '../containers/InfiniteScrolling';
import InfiniteScrolling from '../containers/InfiniteScrolling';
import type { Source } from '../../graphql/sources';
import { SourceType } from '../../graphql/sources';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Separator } from '../cards/common/common';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { FollowButton } from '../contentPreference/FollowButton';
import { useFeedSettingsEditContext } from '../feeds/FeedSettings/FeedSettingsEditContext';
import { CopyType } from '../sources/SourceActions/SourceActionsFollow';
import { SourceListPlaceholder } from './SourceListPlaceholder';
import { webappUrl } from '../../lib/constants';
import Link from '../utilities/Link';
import { anchorDefaultRel } from '../../lib/strings';
import BlockButton from '../contentPreference/BlockButton';

export interface SourceListProps {
  scrollingProps: Omit<InfiniteScrollingProps, 'children'>;
  sources: Source[];
  placeholderAmount?: number;
  isLoading?: boolean;
  emptyPlaceholder?: JSX.Element;
  showFollow?: boolean;
  showBlock?: boolean;
}

export const SourceList = ({
  placeholderAmount,
  scrollingProps,
  sources,
  isLoading,
  emptyPlaceholder,
  showFollow = true,
  showBlock,
}: SourceListProps): ReactElement => {
  const feedSettingsEditContext = useFeedSettingsEditContext();
  const feed = feedSettingsEditContext?.feed;
  const loader = (
    <SourceListPlaceholder placeholderAmount={placeholderAmount} />
  );

  if (sources?.length) {
    return (
      <InfiniteScrolling
        {...scrollingProps}
        aria-label="source-list"
        placeholder={loader}
      >
        {sources.map((source) => (
          <div className="flex gap-2 px-6 py-3 hover:bg-surface-hover">
            <Link
              key={source.id}
              href={`${webappUrl}${
                source.type === SourceType.Squad ? 'squads' : 'sources'
              }/${source.handle}`}
            >
              <a
                key={source.id}
                className="absolute inset-0 z-0"
                rel={anchorDefaultRel}
                target="_blank"
                aria-label={`View ${source.handle}`}
              />
            </Link>
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
            {showBlock && (
              <BlockButton
                feedId={feed?.id}
                entityId={source.id}
                entityName={`@${source.handle}`}
                entityType={ContentPreferenceType.Source}
                status={source.contentPreference.status}
                className="relative z-1"
              />
            )}
            {showFollow && (
              <FollowButton
                feedId={feed?.id}
                entityId={source.id}
                type={ContentPreferenceType.Source}
                status={source.contentPreference.status}
                entityName={`@${source.handle}`}
                showSubscribe={false}
                copyType={CopyType.Custom}
                className="relative z-1"
              />
            )}
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
