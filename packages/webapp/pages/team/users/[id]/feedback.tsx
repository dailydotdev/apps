import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useUserFeedbackByUserId } from '@dailydotdev/shared/src/graphql/feedback';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import InfiniteScrolling from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { FeedbackCard } from '@dailydotdev/shared/src/components/feedback/FeedbackCard';
import { getLayout } from '../../../../components/layouts/MainLayout';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('User Feedback'),
};

const TeamUserFeedbackPage = (): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const userIdParam = router.query.id;
  const userId = typeof userIdParam === 'string' ? userIdParam : '';
  const isTeamMember = !!user?.isTeamMember;
  const canFetchFeedback = isAuthReady && isTeamMember && !!userId;
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  const query = useUserFeedbackByUserId({
    userId,
    enabled: canFetchFeedback,
  });
  const feedbackItems = useMemo(
    () =>
      query.data?.pages.flatMap((page) =>
        page.userFeedbackByUserId.edges.map((edge) => edge.node),
      ) ?? [],
    [query.data],
  );

  useEffect(() => {
    if (isAuthReady && !isTeamMember) {
      router.replace('/');
    }
  }, [isAuthReady, isTeamMember, router]);

  if (!isAuthReady || !router.isReady) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!isTeamMember) {
    return null;
  }

  if (!userId) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-8">
        <Typography type={TypographyType.Title2} bold>
          Invalid user id
        </Typography>
      </div>
    );
  }

  let content: ReactElement;
  if (query.isLoading) {
    content = (
      <div className="flex w-full justify-center py-8">
        <Loader />
      </div>
    );
  } else if (feedbackItems.length === 0) {
    content = (
      <div className="rounded-16 border border-border-subtlest-tertiary p-4">
        <Typography type={TypographyType.Body}>
          No feedback submitted by this user.
        </Typography>
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Title2} bold>
          User feedback
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          User ID: {userId}
        </Typography>
      </div>
      {content}
    </div>
  );
};

TeamUserFeedbackPage.getLayout = getLayout;
TeamUserFeedbackPage.layoutProps = { seo };

export default TeamUserFeedbackPage;
