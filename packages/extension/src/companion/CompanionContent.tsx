import React, { ReactElement, useState } from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import CopyIcon from '@dailydotdev/shared/icons/copy.svg';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { useInfiniteQuery } from 'react-query';
import {
  HotLabel,
  TLDRText,
} from '@dailydotdev/shared/src/components/utilities';
import '@dailydotdev/shared/src/styles/globals.css';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import UpvotedPopupModal from '@dailydotdev/shared/src/components/modals/UpvotedPopupModal';
import { POST_UPVOTES_BY_ID_QUERY } from '@dailydotdev/shared/src/graphql/posts';
import {
  DEFAULT_UPVOTES_PER_PAGE,
  UpvotesData,
} from '@dailydotdev/shared/src/graphql/common';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { useCopyLink } from '@dailydotdev/shared/src/hooks/useCopyLink';
import classNames from 'classnames';
import useNotification from '@dailydotdev/shared/src/hooks/useNotification';
import { CardNotification } from '@dailydotdev/shared/src/components/cards/Card';
import { getCompanionWrapper } from './common';
import { companionRequest } from './companionRequest';
import { useBackgroundPaginatedRequest } from './useBackgroundPaginatedRequest';

type CompanionContentProps = {
  post: PostBootData;
};

export default function CompanionContent({
  post,
}: CompanionContentProps): ReactElement {
  const { notification, onMessage } = useNotification();
  const queryKey = ['postUpvotes', post.id];
  useBackgroundPaginatedRequest(queryKey);
  const [isUpvotesOpen, setIsUpvotesOpen] = useState(false);
  const [copying, copyLink] = useCopyLink(
    () => `${post.summary}\n\n${post.permalink}`,
  );
  const copyLinkAndNotify = () => {
    copyLink();
    onMessage('✅ Copied TLDR to clipboard');
  };

  const queryResult = useInfiniteQuery<UpvotesData>(
    queryKey,
    ({ pageParam }) =>
      companionRequest(
        `${apiUrl}/graphql`,
        POST_UPVOTES_BY_ID_QUERY,
        {
          id: post.id,
          first: DEFAULT_UPVOTES_PER_PAGE,
          after: pageParam,
        },
        queryKey,
      ),
    {
      enabled: isUpvotesOpen,
      getNextPageParam: (lastPage) =>
        lastPage?.upvotes?.pageInfo?.hasNextPage &&
        lastPage?.upvotes?.pageInfo?.endCursor,
    },
  );

  return (
    <div className="flex flex-col p-6 h-auto rounded-l-16 border w-[22.5rem] border-theme-label-tertiary bg-theme-bg-primary">
      {notification && (
        <CardNotification className="absolute -top-6 right-8 z-2 w-max text-center shadow-2">
          {notification}
        </CardNotification>
      )}
      <div className="flex flex-row gap-3 items-center">
        <a href={post?.commentsPermalink} target="_parent">
          <LogoIcon className="w-8 rounded-8" />
        </a>
        {post?.trending && <HotLabel />}

        {post?.summary && (
          <SimpleTooltip
            placement="top"
            content="Copy link with TLDR"
            appendTo="parent"
            container={{ className: 'shadow-2 whitespace-nowrap' }}
          >
            <Button
              icon={<CopyIcon />}
              className={classNames(
                'ml-auto',
                copying ? 'btn-tertiary-avocado' : ' btn-tertiary',
              )}
              onClick={copyLinkAndNotify}
            />
          </SimpleTooltip>
        )}
      </div>
      <p className="flex-1 my-4 typo-body">
        <TLDRText>TLDR -</TLDRText>
        {post?.summary ??
          `Oops, edge case alert! Our AI-powered TLDR engine couldn't generate a summary for this article. Anyway, we thought it would be an excellent reminder for us all to strive for progress over perfection! Be relentless about learning, growing, and improving. Sometimes shipping an imperfect feature is better than not shipping at all. Enjoy the article!`}
      </p>
      <div
        className="flex gap-x-4 items-center text-theme-label-tertiary typo-callout"
        data-testid="statsBar"
      >
        {post?.numUpvotes <= 0 && post?.numComments <= 0 && (
          <span>Be the first to upvote</span>
        )}
        {post?.numUpvotes > 0 && (
          <ClickableText onClick={() => setIsUpvotesOpen(true)}>
            {post?.numUpvotes} Upvote{post?.numUpvotes > 1 ? 's' : ''}
          </ClickableText>
        )}
        {post?.numComments > 0 && (
          <a
            href={post?.commentsPermalink}
            target="_parent"
            className="hover:underline"
          >
            {post?.numComments.toLocaleString()}
            {` Comment${post?.numComments === 1 ? '' : 's'}`}
          </a>
        )}
      </div>
      {isUpvotesOpen && (
        <UpvotedPopupModal
          isOpen
          parentSelector={getCompanionWrapper}
          queryKey={queryKey}
          queryResult={queryResult}
          listPlaceholderProps={{ placeholderAmount: post?.numUpvotes }}
          onRequestClose={() => setIsUpvotesOpen(false)}
        />
      )}
    </div>
  );
}
