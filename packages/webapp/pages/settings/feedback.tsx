import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { format } from 'date-fns';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import InfiniteScrolling from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import {
  FeedbackStatus,
  useUserFeedback,
} from '@dailydotdev/shared/src/graphql/feedback';
import type { FeedbackItem } from '@dailydotdev/shared/src/graphql/feedback';
import {
  getFeedbackCategoryLabel,
  getFeedbackStatusClassName,
  getFeedbackStatusLabel,
} from '@dailydotdev/shared/src/lib/feedback';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Your Feedback'),
};

const FeedbackCard = ({
  item,
  isExpanded,
  onToggleExpand,
}: {
  item: FeedbackItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
}): ReactElement => {
  const isLongDescription = item.description.length > 260;
  const description = isExpanded
    ? item.description
    : item.description.slice(0, 260);

  return (
    <article className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-surface-hover px-2 py-1 text-xs text-text-secondary">
          {getFeedbackCategoryLabel(item.category)}
        </span>
        <span
          className={`rounded-full bg-surface-hover px-2 py-1 text-xs ${getFeedbackStatusClassName(
            item.status,
          )}`}
        >
          {getFeedbackStatusLabel(item.status)}
        </span>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="ml-auto"
        >
          {format(new Date(item.createdAt), 'dd MMM yyyy')}
        </Typography>
      </div>

      <Typography
        type={TypographyType.Body}
        className="mt-3 whitespace-pre-wrap"
      >
        {description}
        {isLongDescription && !isExpanded ? '...' : ''}
      </Typography>

      {isLongDescription && (
        <Button
          className="mt-2"
          variant={ButtonVariant.Tertiary}
          onClick={onToggleExpand}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </Button>
      )}

      {item.screenshotUrl && (
        <a
          href={item.screenshotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block"
        >
          <img
            src={item.screenshotUrl}
            alt="Feedback screenshot"
            className="max-h-48 w-auto rounded-12 border border-border-subtlest-tertiary"
          />
        </a>
      )}

      {item.replies.length > 0 && (
        <div className="mt-4 border-t border-border-subtlest-tertiary pt-4">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="mb-3"
          >
            Replies
          </Typography>

          <div className="flex flex-col gap-3">
            {item.replies.map((reply) => (
              <div
                key={reply.id}
                className="rounded-12 bg-surface-hover px-3 py-2"
              >
                <Typography type={TypographyType.Footnote} bold>
                  {`${reply.authorName || 'daily.dev team'} from daily.dev`}
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  className="mt-1 whitespace-pre-wrap"
                >
                  {reply.body}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="mt-2"
                >
                  {format(new Date(reply.createdAt), 'dd MMM yyyy')}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

const AccountFeedbackPage = (): ReactElement => {
  const { openModal } = useLazyModal();
  const query = useUserFeedback();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  const feedbackItems = useMemo(
    () =>
      query.data?.pages.flatMap((page) =>
        page.userFeedback.edges.map((edge) => edge.node),
      ) ?? [],
    [query.data],
  );

  const openFeedbackModal = () => openModal({ type: LazyModal.Feedback });

  let content: ReactElement;
  if (query.isLoading) {
    content = (
      <div className="flex w-full justify-center py-8">
        <Loader />
      </div>
    );
  } else if (feedbackItems.length === 0) {
    content = (
      <div className="flex flex-col items-start gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
        <Typography type={TypographyType.Body}>
          No feedback submitted yet.
        </Typography>
        <Button onClick={openFeedbackModal}>Submit feedback</Button>
      </div>
    );
  } else {
    content = (
      <InfiniteScrolling
        className="gap-4"
        canFetchMore={!!query.hasNextPage && !query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        placeholder={
          <div className="flex w-full justify-center py-4">
            <Loader />
          </div>
        }
      >
        {feedbackItems.map((item) => (
          <FeedbackCard
            key={item.id}
            item={item}
            isExpanded={!!expandedItems[item.id]}
            onToggleExpand={() =>
              setExpandedItems((prev) => ({
                ...prev,
                [item.id]: !prev[item.id],
              }))
            }
          />
        ))}
      </InfiniteScrolling>
    );
  }

  return (
    <AccountPageContainer title="Your Feedback">
      {content}

      {!query.isLoading &&
        feedbackItems.length > 0 &&
        feedbackItems.every(
          (item) => item.status === FeedbackStatus.Pending,
        ) && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="mt-4"
          >
            We review every message and will email you when the team replies.
          </Typography>
        )}
    </AccountPageContainer>
  );
};

AccountFeedbackPage.getLayout = getSettingsLayout;
AccountFeedbackPage.layoutProps = { seo };

export default AccountFeedbackPage;
