import React from 'react';
import type { ReactElement } from 'react';

import type { NextSeoProps } from 'next-seo';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import { PlusIcon } from '@dailydotdev/shared/src/components/icons';
import { useRouter } from 'next/router';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';

import { NoOpportunity } from '@dailydotdev/shared/src/features/opportunity/components/NoOpportunity';
import {
  OpportunityEditProvider,
  useOpportunityEditContext,
} from '@dailydotdev/shared/src/components/opportunity/OpportunityEditContext';
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
import { RecruiterHeader } from '@dailydotdev/shared/src/components/recruiter/Header';
import { opportunityEditStep2Schema } from '@dailydotdev/shared/src/lib/schema/opportunity';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { labels } from '@dailydotdev/shared/src/lib/labels';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  RecruiterProgress,
  RecruiterProgressStep,
} from '@dailydotdev/shared/src/components/recruiter/Progress';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';
import { getLayout } from '../../../components/layouts/RecruiterSelfServeLayout';

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
  const { opportunityId, onValidateOpportunity } = useOpportunityEditContext();
  const { showPrompt } = usePrompt();
  const router = useRouter();

  const { data: opportunity, isPending } = useQuery({
    ...opportunityByIdOptions({ id: opportunityId }),
  });

  if (!isAuthReady || isPending || !isLoggedIn) {
    return null;
  }

  if (!opportunity || !isLoggedIn) {
    return <NoOpportunity />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <RecruiterHeader
        headerButton={{
          text: 'Outreach settings',
          onClick: async () => {
            const result = onValidateOpportunity({
              schema: opportunityEditStep2Schema,
            });

            if (result.error) {
              await showPrompt({
                title: labels.opportunity.requiredMissingNotice.title,
                description: (
                  <div className="flex flex-col gap-4">
                    <span>
                      {labels.opportunity.requiredMissingNotice.description}
                    </span>
                    <ul className="text-text-tertiary">
                      {result.error.issues.map((issue) => {
                        const path = issue.path.join('.');

                        return <li key={path}>• {path}</li>;
                      })}
                    </ul>
                  </div>
                ),
                okButton: {
                  className: '!w-full',
                  title: labels.opportunity.requiredMissingNotice.okButton,
                },
                cancelButton: null,
              });

              return;
            }

            router.push(`${webappUrl}recruiter/${opportunityId}/plans`);
          },
        }}
      />
      <RecruiterProgress activeStep={RecruiterProgressStep.PrepareAndLaunch} />
      <div className="flex flex-1 flex-col gap-4 bg-background-subtle py-6">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4">
          <Typography bold center type={TypographyType.LargeTitle}>
            Screening Questions
          </Typography>
          <Typography
            center
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
          >
            AI generated questions to help you quickly assess candidate fit
            before moving forward. You can edit, replace, or remove them to
            match your hiring needs
          </Typography>
        </div>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 laptop:flex-row">
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
                  New question
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
      </div>
    </div>
  );
};

const GetPageLayout: typeof getLayout = (page, layoutProps) => {
  const router = useRouter();
  const { opportunityId } = router.query;

  return (
    <OpportunityEditProvider opportunityId={opportunityId as string}>
      {getLayout(page, {
        ...layoutProps,
        seo,
      })}
    </OpportunityEditProvider>
  );
};
QuestionsSetupPage.getLayout = GetPageLayout;

export default QuestionsSetupPage;
