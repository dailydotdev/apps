import type { ReactElement } from 'react';
import React, { useState, useContext } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { TagSelection } from '../tags/TagSelection';
import { SearchField } from '../fields/SearchField';
import { useTagSearch } from '../../hooks/useTagSearch';
import { Origin } from '../../lib/log';
import useDebounceFn from '../../hooks/useDebounceFn';
import Feed from '../Feed';
import { OtherFeedPage, RequestKey } from '../../lib/query';
import { PREVIEW_FEED_QUERY } from '../../graphql/feed';
import { FeedLayoutProvider } from '../../contexts/FeedContext';
import AuthContext from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import { REQUIRED_TAGS_THRESHOLD } from './common';
import { useInteractiveFeedContext } from '../../contexts/InteractiveFeedContext';
import ProgressCircle from '../ProgressCircle';
import { interactiveFeedEmpty } from '../../lib/image';
import { Image } from '../image/Image';

const InteractiveFeedStep = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onSearch] = useDebounceFn(setSearchQuery, 200);
  const { feedSettings } = useFeedSettings({});
  const { completion } = useInteractiveFeedContext();
  const { data: searchResult } = useTagSearch({
    value: searchQuery,
    origin: Origin.EditTag,
  });
  const searchTags = searchResult?.searchTags.tags || [];
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const hasMinimumTags = tagsCount >= REQUIRED_TAGS_THRESHOLD;

  return (
    <div className="flex w-full max-w-[85rem] flex-row gap-6">
      <section className="flex w-1/4 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Quaternary}
          >
            Step 1
          </Typography>
          <div className="flex gap-2">
            <Typography className="flex-1" type={TypographyType.Title3} bold>
              Pick at least 5 topics to start training your feed{' '}
            </Typography>
            <ProgressCircle progress={completion} />
          </div>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            bold
          >
            These topics will help us generate your first set of
            recommendations. You can refine them anytime after setup.
          </Typography>
        </div>
        <TagSelection
          className="w-full"
          searchElement={
            <SearchField
              aria-label="Search for topics"
              autoFocus
              className="mb-6 w-full"
              inputId="search-filters"
              placeholder="Search javascript, php, git, etc…"
              valueChanged={onSearch}
            />
          }
          searchQuery={searchQuery}
          searchTags={searchTags}
          origin={Origin.EditTag}
        />
      </section>

      <section className="max-w-3/4 mx-auto flex w-full flex-1 flex-col">
        <div className="flex flex-col gap-2 px-4">
          <Typography
            type={TypographyType.Callout}
            className="text-left"
            color={TypographyColor.Tertiary}
          >
            Step 2
          </Typography>
          <Typography
            type={TypographyType.Title3}
            bold
            className="mb-2 text-left"
          >
            Give the algorithm a signal on what&apos;s relevant (and what&apos;s
            not)
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Secondary}
            bold
          >
            Vote on posts to refine your recommendations. The more signals you
            provide, the better your feed adapts to your interests.
          </Typography>
        </div>
        <FeedLayoutProvider>
          <div className="flex">
            {hasMinimumTags ? (
              <Feed
                className="flex-1 p-4"
                feedName={OtherFeedPage.Preview}
                feedQueryKey={[RequestKey.FeedPreview, user?.id]}
                query={PREVIEW_FEED_QUERY}
                showSearch={false}
                options={{ refetchOnMount: true }}
                disableAds
              />
            ) : (
              <Image
                className="mt-10 px-4"
                src={interactiveFeedEmpty}
                alt="Empty feed"
              />
            )}
          </div>
        </FeedLayoutProvider>
      </section>
    </div>
  );
};

export default InteractiveFeedStep;
