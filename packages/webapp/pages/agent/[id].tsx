import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { Slider } from '@dailydotdev/shared/src/components/fields/Slider';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import Markdown from '@dailydotdev/shared/src/components/Markdown';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { featureInterestAgent } from '@dailydotdev/shared/src/lib/featureManagement';
import { UserInterestStatus } from '@dailydotdev/shared/src/graphql/interests';
import {
  interestQueryOptions,
  interestFindingsQueryOptions,
  interestPostsQueryOptions,
} from '@dailydotdev/shared/src/features/interests/queries';
import { useSendInterestCommand } from '@dailydotdev/shared/src/features/interests/hooks/useSendInterestCommand';
import { useUpdateInterest } from '@dailydotdev/shared/src/features/interests/hooks/useUpdateInterest';
import { useDeleteInterest } from '@dailydotdev/shared/src/features/interests/hooks/useDeleteInterest';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getPageSeoTitles } from '../../components/layouts/utils';

const quickActions = ['Explore more', 'Write me a post'];
const sourceLabels: Record<'dailyDev' | 'web' | 'github', string> = {
  dailyDev: 'daily.dev',
  web: 'Web',
  github: 'GitHub',
};
const outputLabels: Record<'feed' | 'post' | 'notification', string> = {
  feed: 'Feed',
  post: 'Posts',
  notification: 'Notifications',
};

const Page = (): ReactElement | null => {
  const router = useRouter();
  const id = router.query.id as string;
  const { user, isAuthReady } = useAuthContext();
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    shouldEvaluate: isAuthReady,
  });

  const [feedback, setFeedback] = useState('');
  const [fomo, setFomo] = useState<number | null>(null);
  const interestQuery = useQuery(interestQueryOptions(id, user));
  const findingsQuery = useQuery(interestFindingsQueryOptions(id, user));
  const postsQuery = useQuery(interestPostsQueryOptions(id, user));
  const { isSending, sendCommand } = useSendInterestCommand(id);
  const { isUpdating, updateInterest } = useUpdateInterest(id);
  const { isDeleting, deleteInterest } = useDeleteInterest({
    onDeleted: () => router.push(`${webappUrl}agent`),
  });

  useEffect(() => {
    if (isAuthReady && !showAgent) {
      router.replace(webappUrl);
    }
  }, [isAuthReady, showAgent, router]);

  if (isAuthReady && !showAgent) {
    return null;
  }

  const interest = interestQuery.data;
  const findings = findingsQuery.data ?? [];
  const posts = postsQuery.data ?? [];
  const isStopped = interest?.status === UserInterestStatus.Stopped;

  const onSendFeedback = () => {
    const trimmed = feedback.trim();
    if (!trimmed || isSending) {
      return;
    }
    sendCommand(trimmed);
    setFeedback('');
  };

  return (
    <ProtectedPage>
      <PageHeader title={interest?.query ?? 'Interest'}>
        <Link href={`${webappUrl}agent`}>
          <Button
            tag="a"
            icon={<ArrowIcon className="-rotate-90" />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        </Link>
      </PageHeader>
      <div className="m-auto flex w-full max-w-[42rem] flex-col gap-6 px-4 py-6">
        {interest && (
          <FlexRow className="flex-wrap items-center gap-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="mr-auto"
            >
              {interest.status}
              {interest.lastRunSummary ? ` · ${interest.lastRunSummary}` : ''}
            </Typography>
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              disabled={isUpdating || isStopped}
              onClick={() =>
                updateInterest({
                  status:
                    interest.status === UserInterestStatus.Active
                      ? UserInterestStatus.Paused
                      : UserInterestStatus.Active,
                })
              }
            >
              {interest.status === UserInterestStatus.Active
                ? 'Pause'
                : 'Resume'}
            </Button>
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              disabled={isUpdating || isStopped}
              onClick={() =>
                updateInterest({ status: UserInterestStatus.Stopped })
              }
            >
              Stop
            </Button>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              loading={isDeleting}
              onClick={() => deleteInterest(id)}
            >
              Delete
            </Button>
          </FlexRow>
        )}

        {interest && (
          <FlexCol className="gap-4 rounded-16 border border-border-subtlest-tertiary p-4">
            <Typography type={TypographyType.Body} bold>
              Settings
            </Typography>
            <FlexCol className="gap-2">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {`FOMO vs quality: ${(fomo ?? interest.fomoThreshold).toFixed(
                  2,
                )} (higher = only the best)`}
              </Typography>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[fomo ?? interest.fomoThreshold]}
                onValueChange={([value]) => setFomo(value)}
                onValueCommit={([value]) =>
                  updateInterest({ fomoThreshold: value })
                }
              />
            </FlexCol>
            <FlexCol className="gap-2">
              <Typography type={TypographyType.Footnote} bold>
                Sources
              </Typography>
              {(['dailyDev', 'web', 'github'] as const).map((key) => (
                <Switch
                  key={key}
                  inputId={`source-${key}`}
                  name={`source-${key}`}
                  checked={!!interest.sources?.[key]}
                  disabled={isUpdating || key !== 'dailyDev'}
                  onToggle={() =>
                    updateInterest({
                      sources: { [key]: !interest.sources?.[key] },
                    })
                  }
                >
                  {sourceLabels[key]}
                </Switch>
              ))}
            </FlexCol>
            <FlexCol className="gap-2">
              <Typography type={TypographyType.Footnote} bold>
                Outputs
              </Typography>
              {(['feed', 'post', 'notification'] as const).map((key) => (
                <Switch
                  key={key}
                  inputId={`output-${key}`}
                  name={`output-${key}`}
                  checked={!!interest.outputModes?.[key]}
                  disabled={isUpdating}
                  onToggle={() =>
                    updateInterest({
                      outputModes: { [key]: !interest.outputModes?.[key] },
                    })
                  }
                >
                  {outputLabels[key]}
                </Switch>
              ))}
            </FlexCol>
          </FlexCol>
        )}

        <FlexCol className="gap-3">
          <Typography type={TypographyType.Body} bold>
            Command the agent
          </Typography>
          <FlexRow className="flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                disabled={isSending}
                onClick={() => sendCommand(action)}
              >
                {action}
              </Button>
            ))}
          </FlexRow>
          <div className="flex items-end gap-2">
            <TextField
              className={{ container: 'flex-1' }}
              inputId="interest-feedback"
              label="Tell the agent how to refine"
              placeholder="e.g. focus on production-grade projects"
              value={feedback}
              valueChanged={setFeedback}
            />
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              onClick={onSendFeedback}
              loading={isSending}
              disabled={!feedback.trim()}
            >
              Send
            </Button>
          </div>
        </FlexCol>

        <FlexCol className="gap-3">
          <FlexRow className="items-center justify-between">
            <Typography type={TypographyType.Body} bold>
              Findings
            </Typography>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              loading={findingsQuery.isFetching}
              onClick={() => findingsQuery.refetch()}
            >
              Refresh
            </Button>
          </FlexRow>
          {findingsQuery.isPending && (
            <Typography color={TypographyColor.Tertiary}>Loading…</Typography>
          )}
          {!findingsQuery.isPending && !findings.length && (
            <Typography color={TypographyColor.Tertiary}>
              No findings yet. The agent may still be hunting — try Refresh in a
              moment.
            </Typography>
          )}
          {findings.map((finding) => {
            const href =
              finding.post?.commentsPermalink ?? finding.post?.permalink;
            const title = finding.post?.title ?? finding.postId;
            const body = (
              <FlexCol className="gap-1">
                <Typography type={TypographyType.Body} bold>
                  {title}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {`Score ${finding.score.toFixed(2)}`}
                  {finding.rationale ? ` · ${finding.rationale}` : ''}
                </Typography>
              </FlexCol>
            );

            return href ? (
              <Link key={finding.id} href={href}>
                <a className="rounded-16 border border-border-subtlest-tertiary p-4 hover:border-border-subtlest-primary">
                  {body}
                </a>
              </Link>
            ) : (
              <div
                key={finding.id}
                className="rounded-16 border border-border-subtlest-tertiary p-4"
              >
                {body}
              </div>
            );
          })}
        </FlexCol>

        <FlexCol className="gap-3">
          <Typography type={TypographyType.Body} bold>
            Posts
          </Typography>
          {!postsQuery.isPending && !posts.length && (
            <Typography color={TypographyColor.Tertiary}>
              No generated posts yet.
            </Typography>
          )}
          {posts.map((post) => (
            <FlexCol
              key={post.id}
              className="gap-2 rounded-16 border border-border-subtlest-tertiary p-4"
            >
              <Typography type={TypographyType.Title3} bold>
                {post.title}
              </Typography>
              {post.contentHtml && <Markdown content={post.contentHtml} />}
            </FlexCol>
          ))}
        </FlexCol>
      </div>
    </ProtectedPage>
  );
};

const getAgentLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  ...getPageSeoTitles('Interest'),
  nofollow: true,
  noindex: true,
};

Page.getLayout = getAgentLayout;
Page.layoutProps = { seo, screenCentered: false };

export default Page;
