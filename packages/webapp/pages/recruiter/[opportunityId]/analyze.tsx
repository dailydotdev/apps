import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { RecruiterHeader } from '@dailydotdev/shared/src/components/recruiter/Header';
import {
  RecruiterProgress,
  RecruiterProgressStep,
} from '@dailydotdev/shared/src/components/recruiter/Progress';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import {
  OpportunityPreviewProvider,
  useOpportunityPreviewContext,
} from '@dailydotdev/shared/src/features/opportunity/context/OpportunityPreviewContext';
import { usePendingSubmission } from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { AnalyzeContent } from '@dailydotdev/shared/src/features/opportunity/components/analyze/AnalyzeContent';
import { AnalyzeStatusBar } from '@dailydotdev/shared/src/components/recruiter/AnalyzeStatusBar';
import { parseOpportunityMutationOptions } from '@dailydotdev/shared/src/features/opportunity/mutations';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { labels } from '@dailydotdev/shared/src/lib';
import { getLayout } from '../../../components/layouts/RecruiterSelfServeLayout';

const useNewOpportunityParser = () => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { pendingSubmission, clearPendingSubmission } = usePendingSubmission();
  const hasStartedParsing = useRef(false);

  const opportunityId = router.query.opportunityId as string;
  const isNewSubmission = opportunityId === 'new';

  const { mutate: parseOpportunity } = useMutation({
    ...parseOpportunityMutationOptions(),
    onSuccess: (opportunity) => {
      clearPendingSubmission();
      router.replace(`/recruiter/${opportunity.id}/analyze`, undefined, {
        shallow: true,
      });
    },
    onError: (error: ApiErrorResult) => {
      clearPendingSubmission();
      const message =
        error?.response?.errors?.[0]?.message || labels.error.generic;
      displayToast(message);
      router.push(`/recruiter?openModal=joblink`);
    },
  });

  useEffect(() => {
    if (!isNewSubmission || hasStartedParsing.current) {
      return;
    }

    if (!pendingSubmission) {
      router.push(`/recruiter?openModal=joblink`);
      return;
    }

    hasStartedParsing.current = true;

    if (pendingSubmission.type === 'url') {
      parseOpportunity({ url: pendingSubmission.url });
    } else {
      parseOpportunity({ file: pendingSubmission.file });
    }
  }, [isNewSubmission, pendingSubmission, parseOpportunity, router]);
};

const useLoadingAnimation = () => {
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setLoadingStep(1), 800),
      setTimeout(() => setLoadingStep(2), 1600),
      setTimeout(() => setLoadingStep(3), 2400),
      setTimeout(() => setLoadingStep(4), 3200),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return loadingStep;
};

const RecruiterPageContent = () => {
  const router = useRouter();
  const { opportunity } = useOpportunityPreviewContext();
  const loadingStep = useLoadingAnimation();

  useNewOpportunityParser();

  const handlePrepareCampaignClick = useCallback(() => {
    if (!opportunity) {
      return;
    }

    router.push(`/recruiter/${opportunity.id}/prepare`);
  }, [router, opportunity]);

  return (
    <div className="flex flex-1 flex-col">
      <RecruiterHeader
        title="Your matched candidates"
        subtitle="Real developers on our platform—including passive talent you won't find elsewhere."
        headerButton={{
          text: 'Prepare campaign',
          onClick: handlePrepareCampaignClick,
          disabled: !opportunity,
        }}
      />
      <RecruiterProgress activeStep={RecruiterProgressStep.AnalyzeAndMatch} />
      <AnalyzeStatusBar loadingStep={loadingStep} />
      <AnalyzeContent loadingStep={loadingStep} />
    </div>
  );
};

function RecruiterPage(): ReactElement {
  return (
    <OpportunityPreviewProvider>
      <RecruiterPageContent />
    </OpportunityPreviewProvider>
  );
}

RecruiterPage.getLayout = getLayout;

export async function getServerSideProps() {
  return { props: {} };
}

export default RecruiterPage;
