import type { ReactElement } from 'react';
import React, { useState } from 'react';
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
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  webappUrl,
  isDevelopment,
} from '@dailydotdev/shared/src/lib/constants';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { featureInterestAgent } from '@dailydotdev/shared/src/lib/featureManagement';
import { useInterest } from '@dailydotdev/shared/src/features/interests/hooks/useInterest';
import { useSendInterestCommand } from '@dailydotdev/shared/src/features/interests/hooks/useSendInterestCommand';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getPageSeoTitles } from '../../components/layouts/utils';

const quickActions = ['Explore more', 'Write me a post'];

const Page = (): ReactElement | null => {
  const router = useRouter();
  const id = router.query.id as string;
  const { isAuthReady } = useAuthContext();
  const { value: flagEnabled } = useConditionalFeature({
    feature: featureInterestAgent,
    shouldEvaluate: isAuthReady,
  });
  const showAgent = flagEnabled || isDevelopment;

  const [feedback, setFeedback] = useState('');
  const { interestQuery, findingsQuery } = useInterest(id);
  const { isSending, sendCommand } = useSendInterestCommand(id);

  if (isAuthReady && !showAgent) {
    return null;
  }

  const interest = interestQuery.data;
  const findings = findingsQuery.data ?? [];

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
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {interest.status}
            {interest.lastRunSummary ? ` · ${interest.lastRunSummary}` : ''}
          </Typography>
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
