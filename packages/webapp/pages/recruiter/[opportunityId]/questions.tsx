import React from 'react';
import type { ReactElement, ReactNode } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import {
  InfoIcon,
  MoveToIcon,
  PlusIcon,
  MagicIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
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
import {
  Button,
  ButtonColor,
} from '@dailydotdev/shared/src/components/buttons/Button';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import { opportunityEditStep2Schema } from '@dailydotdev/shared/src/lib/schema/opportunity';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { labels } from '@dailydotdev/shared/src/lib/labels';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  RecruiterProgress,
  RecruiterProgressStep,
} from '@dailydotdev/shared/src/components/recruiter/Progress';
import {
  updateOpportunityStateOptions,
  recommendOpportunityScreeningQuestionsOptions,
} from '@dailydotdev/shared/src/features/opportunity/mutations';
import type {
  ApiErrorResult,
  ApiResponseError,
  ApiZodErrorExtension,
} from '@dailydotdev/shared/src/graphql/common';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { OpportunityState } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  getLayout,
  layoutProps,
} from '../../../components/layouts/RecruiterFullscreenLayout';

const QuestionsSetupPage = (): ReactElement => {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { openModal } = useLazyModal();
  const { opportunityId, onValidateOpportunity } = useOpportunityEditContext();
  const { showPrompt } = usePrompt();
  const router = useRouter();
  const { displayToast } = useToastNotification();

  const { data: opportunity, isPending } = useQuery({
    ...opportunityByIdOptions({ id: opportunityId }),
  });

  const queryClient = useQueryClient();

  const onValidationError = async ({
    issues,
  }: {
    issues: ReturnType<typeof onValidateOpportunity>['error']['issues'];
  }) => {
    await showPrompt({
      title: labels.opportunity.requiredMissingNotice.title,
      description: (
        <div className="flex flex-col gap-4">
          <span>{labels.opportunity.requiredMissingNotice.description}</span>
          <ul className="text-text-tertiary">
            {issues.map((issue) => {
              const path = issue.path.join('.');

              return <li key={path}>• {issue.message}</li>;
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
  };

  const onSuccess = async () => {
    await router.push(`${webappUrl}recruiter/${opportunityId}/matches`);
  };

  const {
    mutateAsync: updateOpportunityState,
    isPending: isPendingOpportunityState,
  } = useMutation({
    ...updateOpportunityStateOptions(),
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: opportunityByIdOptions({ id: opportunityId }).queryKey,
      });

      await onSuccess();
    },
    onError: async (error: ApiErrorResult) => {
      if (
        error.response?.errors?.[0]?.extensions?.code ===
        ApiError.PaymentRequired
      ) {
        if (opportunity.organization?.recruiterTotalSeats > 0) {
          displayToast('You need more seats to publish this job.');

          openModal({
            type: LazyModal.RecruiterSeats,
            props: {
              opportunityId: opportunity.id,
              onNext: async () => {
                await showPrompt({
                  title: labels.opportunity.assignSeat.title,
                  description: labels.opportunity.assignSeat.description,
                  okButton: {
                    title: labels.opportunity.assignSeat.okButton,
                  },
                  cancelButton: {
                    title: labels.opportunity.assignSeat.cancelButton,
                  },
                });

                await updateOpportunityState({
                  id: opportunity.id,
                  state: OpportunityState.IN_REVIEW,
                });

                await onSuccess();
              },
            },
          });
        } else {
          await router.push(`${webappUrl}recruiter/${opportunityId}/plans`);
        }

        return;
      }

      if (
        error.response?.errors?.[0]?.extensions?.code ===
        ApiError.ZodValidationError
      ) {
        const apiError = error.response
          .errors[0] as ApiResponseError<ApiZodErrorExtension>;

        await onValidationError({
          issues: apiError.extensions.issues,
        });

        return;
      }

      displayToast(
        error.response?.errors?.[0]?.message || labels.error.generic,
      );
    },
  });

  const { mutate: generateQuestions, isPending: isGeneratingQuestions } =
    useMutation({
      ...recommendOpportunityScreeningQuestionsOptions(),
      onSuccess: async () => {
        await queryClient.refetchQueries({
          queryKey: opportunityByIdOptions({ id: opportunityId }).queryKey,
        });
      },
      onError: () => {
        displayToast(
          'We could not generate questions. Please try again or add them manually.',
        );
      },
    });

  if (!isAuthReady || isPending || !isLoggedIn) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!opportunity || !isLoggedIn) {
    return <NoOpportunity />;
  }

  const handleNextStep = async () => {
    const result = onValidateOpportunity({
      schema: opportunityEditStep2Schema,
    });

    if (result.error) {
      await onValidationError({ issues: result.error.issues });

      return;
    }

    await updateOpportunityState({
      id: opportunity.id,
      state: OpportunityState.IN_REVIEW,
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-header flex items-center justify-between gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3 laptop:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <HeaderLogo isRecruiter href="/recruiter" />
          <div className="mx-2 h-6 w-px bg-border-subtlest-tertiary" />
          <div>
            <Typography type={TypographyType.Title2} bold>
              Screening Questions
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Questions candidates will answer before you connect.
            </Typography>
          </div>
        </div>

        <Button
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          onClick={handleNextStep}
          loading={isPendingOpportunityState}
        >
          <span className="mr-1.5">Submit for review</span>
          <MoveToIcon />
        </Button>
      </header>

      <RecruiterProgress activeStep={RecruiterProgressStep.PrepareAndLaunch} />
      <div className="flex flex-1 flex-col gap-4 bg-background-subtle py-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 overflow-hidden px-4">
          <div className="flex w-full items-start gap-3 rounded-12 border border-status-info bg-background-default p-4">
            <InfoIcon
              size={IconSize.Small}
              className="mt-0.5 shrink-0 text-status-info"
            />
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
              className="min-w-0 shrink"
            >
              Our AI agent already reviews CVs for skills and experience. Use
              these questions to learn what CVs don&apos;t cover: work
              authorization, relocation preferences, notice period, a relevant
              technical challenge they faced, or what draws them to this
              specific role.
              <br />
              <br />
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                bold
              >
                Add up to 3 questions.
              </Typography>
            </Typography>
          </div>
          {/* Generate questions button - shown when no questions exist */}
          {opportunity.questions.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-6">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                className="text-center"
              >
                Let our AI generate screening questions based on your job
                description.
              </Typography>
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                onClick={() => generateQuestions({ id: opportunity.id })}
                loading={isGeneratingQuestions}
                icon={<MagicIcon />}
              >
                Generate questions
              </Button>
            </div>
          )}

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

const GetPageLayout = (page: ReactNode): ReactNode => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  const { opportunityId } = router.query;

  return (
    <OpportunityEditProvider opportunityId={opportunityId as string}>
      {getLayout(page)}
    </OpportunityEditProvider>
  );
};

QuestionsSetupPage.getLayout = GetPageLayout;
QuestionsSetupPage.layoutProps = layoutProps;

export async function getServerSideProps() {
  return { props: {} };
}

export default QuestionsSetupPage;
