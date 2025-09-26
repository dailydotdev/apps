import React from 'react';
import type { ReactElement } from 'react';

import type { NextSeoProps } from 'next-seo';
import type { GetStaticPathsResult, GetStaticProps } from 'next';
import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import { MagicIcon, PlusIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useRouter } from 'next/router';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';

import { NoOpportunity } from '@dailydotdev/shared/src/features/opportunity/components/NoOpportunity';
import { OpportunityEditProvider } from '@dailydotdev/shared/src/components/opportunity/OpportunityEditContext';
import { OpportunitySteps } from '@dailydotdev/shared/src/components/opportunity/OpportunitySteps';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import classNames from 'classnames';
import { OpportunityEditButton } from '@dailydotdev/shared/src/components/opportunity/OpportunityEditButton';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { opportunityPageLayoutProps } from '../../../components/layouts/utils';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';
import { getLayout } from '../../../components/layouts/RecruiterLayout';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const QuestionsSetupPage = (): ReactElement => {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { openModal } = useLazyModal();
  const {
    query: { id },
  } = useRouter();

  const { data: opportunity, isPending } = useQuery({
    ...opportunityByIdOptions({ id: id as string }),
  });

  if (!isAuthReady || isPending || !isLoggedIn) {
    return null;
  }

  if (!opportunity || !isLoggedIn) {
    return <NoOpportunity />;
  }

  return (
    <>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4">
        <MagicIcon className="text-brand-default" size={IconSize.Medium} />
        <Typography bold center type={TypographyType.LargeTitle}>
          Screening Questions
        </Typography>
        <Typography
          center
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
        >
          AI generated questions to help you quickly assess candidate fit before
          moving forward. You can edit, replace, or remove them to match your
          hiring needs
        </Typography>
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 laptop:flex-row">
        <div className="flex h-full min-w-0 max-w-full flex-1 flex-shrink-0 flex-col gap-4 rounded-16">
          {opportunity.questions.map((question, index) => {
            return (
              <article
                key={question.id}
                className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4"
              >
                <header className="flex items-center justify-between">
                  <div
                    className={classNames(
                      'flex size-7 items-center justify-center rounded-full bg-surface-primary text-center text-surface-invert',
                    )}
                  >
                    <Typography bold type={TypographyType.Footnote}>
                      {index + 1}
                    </Typography>
                  </div>
                  <OpportunityEditButton
                    variant={ButtonVariant.Tertiary}
                    onClick={() => {
                      openModal({
                        type: LazyModal.OpportunityEdit,
                        props: {
                          type: 'question',
                          payload: {
                            id: opportunity.id,
                            index,
                          },
                        },
                      });
                    }}
                  />
                </header>
                <div className="flex flex-col gap-2">
                  <Typography type={TypographyType.Title3}>
                    {question.title}
                  </Typography>
                  {!!question.placeholder && (
                    <Typography color={TypographyColor.Tertiary}>
                      <Typography tag={TypographyTag.Span} bold>
                        Answer hint:
                      </Typography>{' '}
                      {question.placeholder}
                    </Typography>
                  )}
                </div>
              </article>
            );
          })}
          {opportunity.questions.length < 3 && (
            <article className="flex items-center justify-between gap-4 rounded-16 bg-surface-float p-4">
              <Typography color={TypographyColor.Tertiary}>
                New questions
              </Typography>
              <Button
                type="button"
                variant={ButtonVariant.Secondary}
                onClick={() => {
                  openModal({
                    type: LazyModal.OpportunityEdit,
                    props: {
                      type: 'question',
                      payload: {
                        id: opportunity.id,
                        index: opportunity.questions.length,
                      },
                    },
                  });
                }}
                size={ButtonSize.Small}
                icon={<PlusIcon />}
              >
                Add
              </Button>
            </article>
          )}
        </div>
      </div>
    </>
  );
};

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const id = ctx.params?.id;
  if (!id || typeof id !== 'string') {
    return { notFound: true };
  }

  try {
    const queryClient = new QueryClient();
    const opportunity = await queryClient.fetchQuery(
      opportunityByIdOptions({ id }),
    );

    if (!opportunity) {
      return { props: { opportunity: null }, revalidate: 60 };
    }

    const dehydratedState = dehydrate(queryClient);

    return {
      props: { dehydratedState },
      revalidate: 300,
    };
  } catch (_e) {
    return { props: { opportunity: null }, revalidate: 60 };
  }
};

const GetPageLayout: typeof getLayout = (page, layoutProps) => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <OpportunityEditProvider opportunityId={id as string}>
      {getLayout(page, {
        ...layoutProps,
        additionalButtons: (
          <OpportunitySteps
            step={2}
            totalSteps={2}
            ctaText="Approve & publish"
          />
        ),
      })}
    </OpportunityEditProvider>
  );
};

QuestionsSetupPage.getLayout = GetPageLayout;
QuestionsSetupPage.layoutProps = {
  ...opportunityPageLayoutProps,
  seo,
};

export default QuestionsSetupPage;
