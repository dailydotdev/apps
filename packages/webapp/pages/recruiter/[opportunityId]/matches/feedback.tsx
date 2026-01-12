import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { ConnectHeader } from '@dailydotdev/shared/src/components/recruiter/ConnectHeader';
import { ConnectProgress } from '@dailydotdev/shared/src/components/recruiter/ConnectProgress';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { FeedbackList } from '@dailydotdev/shared/src/components/recruiter/FeedbackList';
import { OpportunityProvider } from '@dailydotdev/shared/src/features/opportunity/context/OpportunityContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useQuery } from '@tanstack/react-query';
import {
  opportunityByIdOptions,
  opportunityFeedbackQueryOptions,
} from '@dailydotdev/shared/src/features/opportunity/queries';
import { useRequirePayment } from '@dailydotdev/shared/src/features/opportunity/hooks/useRequirePayment';
import { getLayout } from '../../../../components/layouts/RecruiterSelfServeLayout';

function RecruiterFeedbackPage(): ReactElement {
  const router = useRouter();
  const { opportunityId } = router.query;

  const { data: opportunity } = useQuery(
    opportunityByIdOptions({ id: opportunityId as string }),
  );

  const { isCheckingPayment } = useRequirePayment({
    opportunity,
    opportunityId: opportunityId as string,
  });

  const { data: feedbackData, isLoading } = useQuery(
    opportunityFeedbackQueryOptions({
      opportunityId: opportunityId as string,
      first: 50,
    }),
  );

  const feedback = feedbackData?.edges?.map((edge) => edge.node) ?? [];

  if (isLoading || isCheckingPayment) {
    return (
      <OpportunityProvider opportunityId={opportunityId as string}>
        <div className="flex flex-1 flex-col">
          <ConnectHeader activeTab="feedback" />
          <ConnectProgress />
          <div className="flex flex-1 items-center justify-center bg-background-subtle">
            <Loader />
          </div>
        </div>
      </OpportunityProvider>
    );
  }

  return (
    <OpportunityProvider opportunityId={opportunityId as string}>
      <div className="flex flex-1 flex-col">
        <ConnectHeader activeTab="feedback" />
        <ConnectProgress />
        <div className="flex flex-1 flex-col gap-6 bg-background-subtle p-6">
          {feedback.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-6">
              <Typography type={TypographyType.Mega3} bold center>
                No feedback yet
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Tertiary}
                center
              >
                We track rejection feedback from candidates to help you improve
                your listing. When candidates pass on your opportunity, their
                feedback will appear here so you can make your job posting more
                appealing.
              </Typography>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl">
              <FeedbackList feedback={feedback} />
            </div>
          )}
        </div>
      </div>
    </OpportunityProvider>
  );
}

RecruiterFeedbackPage.getLayout = getLayout;

export default RecruiterFeedbackPage;
