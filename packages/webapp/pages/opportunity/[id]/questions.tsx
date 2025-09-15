import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';

import type { NextSeoProps } from 'next-seo';

import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { useRouter } from 'next/router';
import ProgressCircle from '@dailydotdev/shared/src/components/ProgressCircle';
import {
  useActions,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useMutation, useQuery } from '@tanstack/react-query';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import type { OpportunityScreeningAnswer } from '@dailydotdev/shared/src/features/opportunity/types';
import {
  acceptOpportunityMatchMutationOptions,
  saveOpportunityScreeningAnswersMutationOptions,
} from '@dailydotdev/shared/src/features/opportunity/mutations';
import { opportunityUrl } from '@dailydotdev/shared/src/lib/constants';
import { getLayout } from '../../../components/layouts/NoSidebarLayout';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';
import { opportunityPageLayoutProps } from '../../../components/layouts/utils';
import { InnerPreferencePage } from './preference';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const AcceptPage = (): ReactElement => {
  const {
    query: { id },
    push,
    back,
  } = useRouter();
  const opportunityId = id as string;
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [activeAnswer, setActiveAnswer] = useState('');
  const [showPreferenceForm, setShowPreferenceForm] = useState(false);
  const [answers, setAnswers] = useState<
    Record<string, OpportunityScreeningAnswer>
  >({});
  const { completeAction, isActionsFetched, checkHasCompleted } = useActions();
  const { displayToast } = useToastNotification();

  const hasSetPreferences = checkHasCompleted(
    ActionType.UserCandidatePreferencesSaved,
  );

  const { data: opportunity, isPending } = useQuery({
    ...opportunityByIdOptions({ id: opportunityId }),
  });

  const { mutate: acceptOpportunity } = useMutation({
    ...acceptOpportunityMatchMutationOptions(opportunityId),
    onSuccess: async () => {
      await push(`${opportunityUrl}/${opportunityId}/notify`);
    },
    onError: () => {
      displayToast('Failed to accept opportunity. Please try again.');
    },
  });

  const { mutate: saveAnswers } = useMutation({
    ...saveOpportunityScreeningAnswersMutationOptions(opportunityId),
    onSuccess: async () => {
      if (hasSetPreferences) {
        acceptOpportunity();
      } else {
        setShowPreferenceForm(true);
      }
    },
    onError: () => {
      displayToast('Failed to save answers. Please try again.');
    },
  });

  const questions = opportunity?.questions || [];

  const handleNext = () => {
    if (activeQuestion === questions.length - 1) {
      saveAnswers(Object.values(answers));
      return;
    }
    setActiveQuestion((current) => current + 1);
    setActiveAnswer('');
  };

  const handleBack = () => {
    if (activeQuestion === 0) {
      back();
      return;
    }
    setActiveQuestion((current) => current - 1);
    setActiveAnswer(answers[activeQuestion - 1]?.answer || '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setActiveAnswer(e.target.value);
    setAnswers((current) => ({
      ...current,
      [activeQuestion]: {
        questionId: questions[activeQuestion].id,
        answer: e.target.value,
      },
    }));
  };

  useEffect(() => {
    if (!isActionsFetched) {
      return;
    }
    completeAction(ActionType.OpportunityInitialView);
  }, [completeAction, isActionsFetched]);

  if (!opportunity || isPending) {
    return null;
  }

  return (
    <div className="mx-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        {!showPreferenceForm && (
          <>
            <FlexCol className="gap-4">
              <Typography type={TypographyType.LargeTitle} bold center>
                A few quick checks before we intro
              </Typography>
              <Typography
                type={TypographyType.Title3}
                color={TypographyColor.Secondary}
                center
              >
                These help confirm the role is truly worth your time and ensure
                the recruiter already sees you as a strong match.
              </Typography>
            </FlexCol>
            <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
              <FlexRow className="items-center gap-2">
                <ProgressCircle
                  size={16}
                  stroke={2}
                  progress={(activeQuestion / questions.length) * 100}
                />
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  Step {activeQuestion + 1} of {questions.length}
                </Typography>
              </FlexRow>
              <Typography type={TypographyType.Title3}>
                {questions[activeQuestion].title}
              </Typography>
              <Textarea
                inputId="one"
                placeholder={questions[activeQuestion].placeholder}
                label="question[1]"
                rows={5}
                maxLength={500}
                fieldType="quaternary"
                value={activeAnswer}
                onChange={handleChange}
              />
            </FlexCol>
            <FlexRow className="justify-between">
              <Button
                size={ButtonSize.Large}
                variant={ButtonVariant.Tertiary}
                className="hidden laptop:flex"
                onClick={handleBack}
              >
                {activeQuestion === 0 ? 'Back' : '← Previous question'}
              </Button>
              <Button
                size={ButtonSize.Large}
                variant={ButtonVariant.Primary}
                className="w-full laptop:w-auto"
                onClick={handleNext}
                disabled={!activeAnswer.trim()}
              >
                {activeQuestion === questions.length - 1
                  ? 'Submit'
                  : 'Next question →'}
              </Button>
            </FlexRow>
          </>
        )}

        {showPreferenceForm && (
          <>
            <InnerPreferencePage
              buttons={
                <>
                  <Button
                    size={ButtonSize.Large}
                    variant={ButtonVariant.Tertiary}
                    className="hidden laptop:flex"
                    onClick={() => setShowPreferenceForm(false)}
                  >
                    Back
                  </Button>

                  <Button
                    size={ButtonSize.Large}
                    variant={ButtonVariant.Primary}
                    className="w-full laptop:w-auto"
                    onClick={() => acceptOpportunity()}
                    disabled={!hasSetPreferences}
                  >
                    Submit
                  </Button>
                </>
              }
            />
          </>
        )}
      </FlexCol>
    </div>
  );
};

const getPageLayout: typeof getLayout = (...page) => getLayout(...page);

AcceptPage.getLayout = getPageLayout;
AcceptPage.layoutProps = {
  ...opportunityPageLayoutProps,
  seo,
};

export default AcceptPage;
