import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import InfiniteScrolling from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { FeedbackCard } from '@dailydotdev/shared/src/components/feedback/FeedbackCard';
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeedbackCategory,
  FeedbackStatus,
  useFeedbackList,
} from '@dailydotdev/shared/src/graphql/feedback';
import type { FeedbackItem } from '@dailydotdev/shared/src/graphql/feedback';
import {
  getFeedbackCategoryLabel,
  getFeedbackStatusLabel,
} from '@dailydotdev/shared/src/lib/feedback';
import { getLayout } from '../../components/layouts/MainLayout';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { defaultSeo } from '../../next-seo';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Open Feedback'),
};

const OPEN_FEEDBACK_STATUSES = [
  FeedbackStatus.Pending,
  FeedbackStatus.Processing,
  FeedbackStatus.Accepted,
];

const statusOptions = [
  { label: 'Open', value: 'open' as const },
  {
    label: getFeedbackStatusLabel(FeedbackStatus.Pending),
    value: 'pending' as const,
  },
  {
    label: getFeedbackStatusLabel(FeedbackStatus.Processing),
    value: 'processing' as const,
  },
  {
    label: getFeedbackStatusLabel(FeedbackStatus.Accepted),
    value: 'accepted' as const,
  },
];

const categoryOptions = [
  { label: 'All categories', value: undefined },
  { label: 'General', value: FeedbackCategory.Unspecified },
  {
    label: getFeedbackCategoryLabel(FeedbackCategory.BugReport),
    value: FeedbackCategory.BugReport,
  },
  {
    label: getFeedbackCategoryLabel(FeedbackCategory.FeatureRequest),
    value: FeedbackCategory.FeatureRequest,
  },
  {
    label: getFeedbackCategoryLabel(FeedbackCategory.UxIssue),
    value: FeedbackCategory.UxIssue,
  },
  {
    label: getFeedbackCategoryLabel(FeedbackCategory.PerformanceComplaint),
    value: FeedbackCategory.PerformanceComplaint,
  },
  {
    label: getFeedbackCategoryLabel(FeedbackCategory.ContentQuality),
    value: FeedbackCategory.ContentQuality,
  },
];

type StatusFilterValue = (typeof statusOptions)[number]['value'];

const getStatusFilter = (
  statusFilter: StatusFilterValue,
): {
  status?: FeedbackStatus;
  statuses?: FeedbackStatus[];
} => {
  switch (statusFilter) {
    case 'pending':
      return { status: FeedbackStatus.Pending };
    case 'processing':
      return { status: FeedbackStatus.Processing };
    case 'accepted':
      return { status: FeedbackStatus.Accepted };
    case 'open':
    default:
      return { statuses: OPEN_FEEDBACK_STATUSES };
  }
};

const TeamFeedbackUser = ({
  item,
}: {
  item: Pick<FeedbackItem, 'user'>;
}): ReactElement | null => {
  if (!item.user) {
    return null;
  }

  return (
    <Link href={`/team/users/${item.user.id}/feedback`}>
      <a className="mb-3 flex items-center gap-3 rounded-12 px-1 transition-colors hover:bg-surface-hover">
        <ProfilePicture
          user={{ ...item.user, image: item.user.image ?? '' }}
          size={ProfileImageSize.Small}
        />
        <div className="flex min-w-0 flex-col">
          <Typography type={TypographyType.Callout} bold className="truncate">
            {item.user.name || item.user.username || item.user.id}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="truncate"
          >
            {item.user.username ? `@${item.user.username}` : item.user.id}
          </Typography>
        </div>
      </a>
    </Link>
  );
};

const TeamFeedbackPage = (): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const isTeamMember = !!user?.isTeamMember;
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('open');
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory>();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  const { status, statuses } = getStatusFilter(statusFilter);
  const query = useFeedbackList({
    status,
    statuses,
    category: categoryFilter,
    enabled: isAuthReady && isTeamMember,
  });

  const feedbackItems = useMemo(
    () =>
      query.data?.pages.flatMap((page) =>
        page.feedbackList.edges.map((edge) => edge.node),
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
          No feedback matches the current filters.
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
          <div key={item.id}>
            <TeamFeedbackUser item={item} />
            <FeedbackCard
              item={item}
              isExpanded={!!expandedItems[item.id]}
              onToggleExpand={() =>
                setExpandedItems((prev) => ({
                  ...prev,
                  [item.id]: !prev[item.id],
                }))
              }
            />
          </div>
        ))}
      </InfiniteScrolling>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Title2} bold>
          Open feedback
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Review unresolved feedback across all users, then jump into a
          user&apos;s history when you need more context.
        </Typography>
      </div>

      <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4 tablet:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Status
          </Typography>
          <Dropdown
            selectedIndex={statusOptions.findIndex(
              (option) => option.value === statusFilter,
            )}
            options={statusOptions.map((option) => option.label)}
            onChange={(_, index) => setStatusFilter(statusOptions[index].value)}
            buttonSize={ButtonSize.Medium}
            buttonVariant={ButtonVariant.Float}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Category
          </Typography>
          <Dropdown
            selectedIndex={categoryOptions.findIndex(
              (option) => option.value === categoryFilter,
            )}
            options={categoryOptions.map((option) => option.label)}
            onChange={(_, index) =>
              setCategoryFilter(categoryOptions[index].value)
            }
            buttonSize={ButtonSize.Medium}
            buttonVariant={ButtonVariant.Float}
          />
        </div>
      </div>

      {content}
    </div>
  );
};

TeamFeedbackPage.getLayout = getLayout;
TeamFeedbackPage.layoutProps = { seo };

export default TeamFeedbackPage;
