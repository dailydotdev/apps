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
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  webappUrl,
  isDevelopment,
} from '@dailydotdev/shared/src/lib/constants';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { featureInterestAgent } from '@dailydotdev/shared/src/lib/featureManagement';
import { useInterests } from '@dailydotdev/shared/src/features/interests/hooks/useInterests';
import { useCreateInterest } from '@dailydotdev/shared/src/features/interests/hooks/useCreateInterest';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getPageSeoTitles } from '../../components/layouts/utils';

const Page = (): ReactElement | null => {
  const router = useRouter();
  const { isAuthReady } = useAuthContext();
  const { value: flagEnabled } = useConditionalFeature({
    feature: featureInterestAgent,
    shouldEvaluate: isAuthReady,
  });
  const showAgent = flagEnabled || isDevelopment;

  const [query, setQuery] = useState('');
  const { data: interests, isPending } = useInterests();
  const { isCreating, createInterest } = useCreateInterest({
    onCreated: (id) => router.push(`${webappUrl}agent/${id}`),
  });

  useEffect(() => {
    if (isAuthReady && !showAgent) {
      router.replace(webappUrl);
    }
  }, [isAuthReady, showAgent, router]);

  if (isAuthReady && !showAgent) {
    return null;
  }

  const onSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed || isCreating) {
      return;
    }
    createInterest(trimmed);
  };

  return (
    <ProtectedPage>
      <PageHeader title="Your interests" />
      <div className="m-auto flex w-full max-w-[42rem] flex-col gap-6 px-4 py-6">
        <FlexCol className="gap-3">
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            Spawn an agent that hunts daily.dev for content on a topic you care
            about.
          </Typography>
          <div className="flex items-end gap-2">
            <TextField
              className={{ container: 'flex-1' }}
              inputId="interest-query"
              label="What are you interested in?"
              placeholder="e.g. cool zig projects"
              value={query}
              valueChanged={setQuery}
            />
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              onClick={onSubmit}
              loading={isCreating}
              disabled={!query.trim()}
            >
              Create
            </Button>
          </div>
        </FlexCol>

        <FlexCol className="gap-3">
          {isPending && (
            <Typography color={TypographyColor.Tertiary}>Loading…</Typography>
          )}
          {!isPending && !interests?.length && (
            <Typography color={TypographyColor.Tertiary}>
              No interests yet. Create your first one above.
            </Typography>
          )}
          {interests?.map((interest) => (
            <Link key={interest.id} href={`${webappUrl}agent/${interest.id}`}>
              <a className="rounded-16 border border-border-subtlest-tertiary p-4 hover:border-border-subtlest-primary">
                <FlexCol className="gap-1">
                  <Typography type={TypographyType.Body} bold>
                    {interest.query}
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {interest.status}
                    {interest.lastRunSummary
                      ? ` · ${interest.lastRunSummary}`
                      : ''}
                  </Typography>
                </FlexCol>
              </a>
            </Link>
          ))}
        </FlexCol>
      </div>
    </ProtectedPage>
  );
};

const getAgentLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  ...getPageSeoTitles('Your interests'),
  nofollow: true,
  noindex: true,
};

Page.getLayout = getAgentLayout;
Page.layoutProps = { seo, screenCentered: false };

export default Page;
