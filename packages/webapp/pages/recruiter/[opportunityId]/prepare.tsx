import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { FormProvider } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import {
  RecruiterProgress,
  RecruiterProgressStep,
} from '@dailydotdev/shared/src/components/recruiter/Progress';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonVariant,
  ButtonSize,
  ButtonColor,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MoveToIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import {
  OpportunityEditProvider,
  useOpportunityEditContext,
} from '@dailydotdev/shared/src/components/opportunity/OpportunityEditContext';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { useUpdateQuery } from '@dailydotdev/shared/src/hooks/useUpdateQuery';
import { recommendOpportunityScreeningQuestionsOptions } from '@dailydotdev/shared/src/features/opportunity/mutations';
import {
  ToastSubject,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks/useToastNotification';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { useOpportunityEditPageSetup } from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/hooks/useOpportunityEditPageSetup';
import {
  OpportunityCompletenessBar,
  hasMissingRequiredFields,
} from '@dailydotdev/shared/src/components/opportunity/OpportunityCompletenessBar';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { OpportunityEditPanel } from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/OpportunityEditPanel';
import {
  EditPreviewTabs,
  EditPreviewTab,
} from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/EditPreviewTabs';
import { BrowserPreviewFrame } from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/BrowserPreviewFrame';
import JobPage from '../../jobs/[id]';
import {
  getLayout,
  layoutProps,
} from '../../../components/layouts/RecruiterFullscreenLayout';

function PreparePageContent(): ReactElement {
  const router = useRouter();
  const { opportunityId } = useOpportunityEditContext();
  const { dismissToast, displayToast, subject } = useToastNotification();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [activeTab, setActiveTab] = useState<EditPreviewTab>(
    EditPreviewTab.Edit,
  );

  const {
    opportunity,
    liveOpportunity,
    isLoading,
    previewData,
    form,
    isDirty,
    isSaving,
    handleSectionFocus,
    handleMissingClick,
    handleSave,
  } = useOpportunityEditPageSetup({ opportunityId });

  // Check if there are missing required fields (excludes organization check for prepare page)
  const hasIncompleteFields = hasMissingRequiredFields(liveOpportunity, [
    'organization',
  ]);

  const [, updateOpportunity] = useUpdateQuery(
    opportunityByIdOptions({
      id: opportunityId,
    }),
  );

  const goToNextStep = async () => {
    await router.push(`${webappUrl}recruiter/${opportunityId}/questions`);
  };

  const {
    mutate: onSubmit,
    isPending: isSubmitting,
    isSuccess,
  } = useMutation({
    ...recommendOpportunityScreeningQuestionsOptions(),
    mutationFn: async ({ id }: { id: string }) => {
      if (opportunity?.questions?.length) {
        return opportunity.questions;
      }

      displayToast(
        'Just a moment, generating screening questions for your job....',
        {
          subject: ToastSubject.OpportunityScreeningQuestions,
          timer: 10_000,
        },
      );

      return await recommendOpportunityScreeningQuestionsOptions().mutationFn({
        id,
      });
    },
    onSuccess: async (data) => {
      updateOpportunity({ ...opportunity, questions: data });

      await goToNextStep();
    },
    onError: async (error: ApiErrorResult) => {
      if (error.response?.errors?.[0]?.extensions?.code !== ApiError.Conflict) {
        displayToast(
          'We could not generate questions but you can add some manually. Sorry for that!',
          {
            subject: null,
          },
        );
      }

      await goToNextStep();
    },
    onSettled: () => {
      if (subject === ToastSubject.OpportunityScreeningQuestions) {
        dismissToast();
      }
    },
  });

  const handleNextStep = useCallback(async () => {
    // First save any pending changes
    if (isDirty) {
      const saved = await handleSave();
      if (!saved) {
        return;
      }
    }

    onSubmit({
      id: opportunity.id,
    });
  }, [isDirty, opportunity?.id, onSubmit, handleSave]);

  if (isLoading || !opportunity) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Desktop: side-by-side layout
  if (isLaptop) {
    return (
      <FormProvider {...form}>
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-header flex items-center justify-between gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3 laptop:py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <HeaderLogo isRecruiter href="/recruiter" />
              <div className="mx-2 h-6 w-px bg-border-subtlest-tertiary" />
              <div>
                <Typography type={TypographyType.Title2} bold>
                  This is how your candidates will see your job
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Review your draft carefully and update any details as needed.
                </Typography>
              </div>
            </div>

            <SimpleTooltip
              content="Complete all required fields first"
              show={hasIncompleteFields}
            >
              <div>
                <Button
                  variant={ButtonVariant.Primary}
                  color={ButtonColor.Cabbage}
                  onClick={handleNextStep}
                  loading={isSaving || isSubmitting || isSuccess}
                  disabled={hasIncompleteFields}
                >
                  <span className="mr-1.5">Outreach questions</span>
                  <MoveToIcon />
                </Button>
              </div>
            </SimpleTooltip>
          </header>

          <RecruiterProgress
            activeStep={RecruiterProgressStep.PrepareAndLaunch}
          />

          {/* Main content */}
          <div className="flex flex-1">
            {/* Edit Panel - 1/3 width */}
            <div className="h-[calc(100vh-112px)] w-1/3 min-w-80 max-w-md overflow-y-auto border-r border-border-subtlest-tertiary bg-background-default">
              <OpportunityCompletenessBar
                opportunity={liveOpportunity}
                className="m-4"
                excludeChecks={['organization']}
                onMissingClick={handleMissingClick}
              />
              <OpportunityEditPanel
                opportunity={opportunity}
                onSectionFocus={handleSectionFocus}
                hideLinkedProfiles
              />
            </div>

            {/* Preview Panel - 2/3 width */}
            <div className="flex-1 overflow-y-auto bg-background-subtle p-6">
              <BrowserPreviewFrame
                url={`${
                  typeof window !== 'undefined' ? window.location.origin : ''
                }/jobs/${opportunityId}`}
                className="h-full"
              >
                <JobPage
                  id={opportunityId}
                  hideHeader
                  hideCompanyBadge
                  hideRecruiterBadge
                  hideCompanyPanel
                  hideRecruiterPanel
                  previewMode
                  previewData={previewData}
                />
              </BrowserPreviewFrame>
            </div>
          </div>
        </div>
      </FormProvider>
    );
  }

  // Mobile: tabbed layout
  return (
    <FormProvider {...form}>
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-header flex items-center justify-between gap-2 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <HeaderLogo isRecruiter href="/recruiter" />
            <div className="mx-2 h-6 w-px bg-border-subtlest-tertiary" />
            <div className="min-w-0">
              <Typography
                type={TypographyType.Callout}
                bold
                className="truncate"
              >
                This is how your candidates will see your job
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                Review your draft carefully and update any details as needed.
              </Typography>
            </div>
          </div>

          <SimpleTooltip
            content="Complete all required fields first"
            show={hasIncompleteFields}
          >
            <div>
              <Button
                variant={ButtonVariant.Primary}
                color={ButtonColor.Cabbage}
                size={ButtonSize.Small}
                onClick={handleNextStep}
                loading={isSaving || isSubmitting || isSuccess}
                disabled={hasIncompleteFields}
              >
                Next
                <MoveToIcon size={IconSize.Small} className="ml-1" />
              </Button>
            </div>
          </SimpleTooltip>
        </header>

        <RecruiterProgress
          activeStep={RecruiterProgressStep.PrepareAndLaunch}
        />

        {/* Tab switcher */}
        <EditPreviewTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === EditPreviewTab.Edit ? (
            <div className="bg-background-default">
              <OpportunityCompletenessBar
                opportunity={liveOpportunity}
                className="m-4"
                excludeChecks={['organization']}
                onMissingClick={handleMissingClick}
              />
              <OpportunityEditPanel
                opportunity={opportunity}
                onSectionFocus={handleSectionFocus}
                hideLinkedProfiles
              />
            </div>
          ) : (
            <div className="bg-background-subtle py-6">
              <JobPage
                id={opportunityId}
                hideHeader
                hideCompanyBadge
                hideRecruiterBadge
                hideCompanyPanel
                hideRecruiterPanel
                previewMode
                previewData={previewData}
              />
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
}

function PreparePage(): ReactElement {
  return <PreparePageContent />;
}

const GetPageLayout = (page: ReactNode): ReactNode => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  const { opportunityId } = router.query;

  return (
    <OpportunityEditProvider opportunityId={opportunityId as string} allowDraft>
      {getLayout(page)}
    </OpportunityEditProvider>
  );
};

PreparePage.getLayout = GetPageLayout;
PreparePage.layoutProps = layoutProps;

export default PreparePage;
