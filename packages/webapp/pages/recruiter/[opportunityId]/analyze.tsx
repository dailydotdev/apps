import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  RecruiterProgress,
  RecruiterProgressStep,
} from '@dailydotdev/shared/src/components/recruiter/Progress';
import { MoveToIcon } from '@dailydotdev/shared/src/components/icons';
import { RecruiterHeader } from '@dailydotdev/shared/src/components/recruiter/Header';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import {
  OpportunityPreviewProvider,
  useOpportunityPreviewContext,
} from '@dailydotdev/shared/src/features/opportunity/context/OpportunityPreviewContext';
import { usePendingSubmission } from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { AnalyzeContent } from '@dailydotdev/shared/src/features/opportunity/components/analyze/AnalyzeContent';
import { AnalyzeStatusBar } from '@dailydotdev/shared/src/components/recruiter/AnalyzeStatusBar';
import {
  parseOpportunityMutationOptions,
  getParseOpportunityMutationErrorMessage,
} from '@dailydotdev/shared/src/features/opportunity/mutations';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { OpportunityPreviewStatus } from '@dailydotdev/shared/src/features/opportunity/types';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { OpportunityState } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import {
  getLayout,
  layoutProps,
} from '../../../components/layouts/RecruiterFullscreenLayout';

interface UseNewOpportunityParserResult {
  isParsing: boolean;
}

const useNewOpportunityParser = (): UseNewOpportunityParserResult => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { pendingSubmission, clearPendingSubmission } = usePendingSubmission();
  const hasStartedParsing = useRef(false);
  const [parsingComplete, setParsingComplete] = useState(false);

  const opportunityId = router.query.opportunityId as string;
  const isNewSubmission = opportunityId === 'new';

  const { mutate: parseOpportunity, isPending } = useMutation({
    ...parseOpportunityMutationOptions(),
    onSuccess: (opportunity) => {
      setParsingComplete(true);
      clearPendingSubmission();
      router.replace(`/recruiter/${opportunity.id}/analyze`, undefined, {
        shallow: true,
      });
    },
    onError: (error: ApiErrorResult) => {
      setParsingComplete(true);
      clearPendingSubmission();
      displayToast(getParseOpportunityMutationErrorMessage(error));
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

  // Consider parsing in progress if:
  // 1. The mutation is currently pending, OR
  // 2. We're on a new submission and parsing hasn't completed yet
  const isParsingInProgress =
    isPending || (isNewSubmission && !parsingComplete);

  return { isParsing: isParsingInProgress };
};

const RecruiterPageContent = () => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const {
    opportunity,
    result,
    isParsing: isBackgroundParsing,
  } = useOpportunityPreviewContext();
  const { isParsing: isMutationParsing } = useNewOpportunityParser();

  const isParseError = opportunity?.state === OpportunityState.ERROR;

  // Show toast and redirect when background parsing fails
  useEffect(() => {
    if (isParseError) {
      displayToast(
        'Failed to process your job description. Please try again with a different file or URL.',
      );

      router.push(`${webappUrl}recruiter?openModal=joblink`);
    }
  }, [isParseError, displayToast, router]);

  // Consider parsing in progress if mutation is pending OR background parsing is happening
  const isParsing = isMutationParsing || isBackgroundParsing;

  const loadingStep = useMemo(() => {
    if (isParsing) {
      return 0;
    }

    if (!result?.status) {
      return 1;
    }

    if (result.status === OpportunityPreviewStatus.PENDING) {
      return 2;
    }

    return 3;
  }, [isParsing, result?.status]);

  const handlePrepareCampaignClick = useCallback(() => {
    if (!opportunity) {
      return;
    }

    router.push(`/recruiter/${opportunity.id}/plans`);
  }, [router, opportunity]);

  const isError = result?.status === OpportunityPreviewStatus.ERROR;

  return (
    <div className="flex flex-1 flex-col">
      <RecruiterHeader
        headerButton={{
          text: 'Select plan',
          icon: <MoveToIcon />,
          onClick: handlePrepareCampaignClick,
          disabled: !opportunity || isParsing,
        }}
      />
      <RecruiterProgress activeStep={RecruiterProgressStep.AnalyzeAndMatch} />
      {!isError && <AnalyzeStatusBar loadingStep={loadingStep} />}
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

const GetPageLayout = (page: ReactNode): ReactNode => {
  return getLayout(page);
};

RecruiterPage.getLayout = GetPageLayout;
RecruiterPage.layoutProps = layoutProps;

export async function getServerSideProps() {
  return { props: {} };
}

export default RecruiterPage;
