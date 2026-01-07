import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { FormProvider, useWatch } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { opportunityEditStep1Schema } from '@dailydotdev/shared/src/lib/schema/opportunity';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { labels } from '@dailydotdev/shared/src/lib/labels';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { useUpdateQuery } from '@dailydotdev/shared/src/hooks/useUpdateQuery';
import { recommendOpportunityScreeningQuestionsOptions } from '@dailydotdev/shared/src/features/opportunity/mutations';
import {
  ToastSubject,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks/useToastNotification';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useRequirePayment } from '@dailydotdev/shared/src/features/opportunity/hooks/useRequirePayment';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { useExitConfirmation } from '@dailydotdev/shared/src/hooks/useExitConfirmation';
import { EDIT_OPPORTUNITY_MUTATION } from '@dailydotdev/shared/src/features/opportunity/graphql';
import type { Opportunity } from '@dailydotdev/shared/src/features/opportunity/types';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import {
  useOpportunityEditForm,
  formDataToPreviewOpportunity,
  formDataToMutationPayload,
  useScrollSync,
} from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit';
import type {
  OpportunitySideBySideEditFormData,
  ScrollSyncSection,
} from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit';
import { OpportunityCompletenessBar } from '@dailydotdev/shared/src/components/opportunity/OpportunityCompletenessBar';
import { OpportunityEditPanel } from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/OpportunityEditPanel';
import {
  EditPreviewTabs,
  EditPreviewTab,
} from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/EditPreviewTabs';
import { BrowserPreviewFrame } from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/BrowserPreviewFrame';
import JobPage from '../../jobs/[id]';
import { getLayout } from '../../../components/layouts/RecruiterFullscreenLayout';

function PreparePageContent(): ReactElement {
  const router = useRouter();
  const { opportunityId, onValidateOpportunity } = useOpportunityEditContext();
  const { showPrompt } = usePrompt();
  const { dismissToast, displayToast, subject } = useToastNotification();
  const queryClient = useQueryClient();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [activeTab, setActiveTab] = useState<EditPreviewTab>(
    EditPreviewTab.Edit,
  );

  const { data: opportunity, isLoading } = useQuery(
    opportunityByIdOptions({ id: opportunityId }),
  );

  const { isCheckingPayment } = useRequirePayment({
    opportunity,
    opportunityId,
  });

  const [, updateOpportunity] = useUpdateQuery(
    opportunityByIdOptions({
      id: opportunityId,
    }),
  );

  // Save mutation for unified form data
  const { mutateAsync: saveOpportunity, isPending: isSaving } = useMutation({
    mutationFn: async (payload: ReturnType<typeof formDataToMutationPayload>) =>
      gqlClient.request<{ editOpportunity: Opportunity }>(
        EDIT_OPPORTUNITY_MUTATION,
        {
          id: opportunityId,
          payload,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Opportunity, null, opportunityId),
      });
    },
  });

  // Initialize form with opportunity data
  const { form, isDirty } = useOpportunityEditForm({
    opportunity,
  });

  // Watch form values for real-time preview
  const formValues = useWatch({
    control: form.control,
  }) as OpportunitySideBySideEditFormData;

  // Convert form data to preview opportunity for real-time updates
  const previewData = useMemo(() => {
    if (!formValues) {
      return undefined;
    }
    return formDataToPreviewOpportunity(formValues);
  }, [formValues]);

  // Scroll sync between edit panel and preview
  const { scrollToSection } = useScrollSync({
    offset: 20,
    behavior: 'smooth',
  });

  const handleSectionFocus = useCallback(
    (sectionId: string) => {
      scrollToSection(sectionId as ScrollSyncSection);
    },
    [scrollToSection],
  );

  // Exit confirmation when navigating away with unsaved changes
  useExitConfirmation({
    message: 'You have unsaved changes. Leave anyway?',
    onValidateAction: useCallback(() => !isDirty, [isDirty]),
  });

  // Save handler
  const handleSave = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      displayToast('Please complete all required fields');
      return false;
    }

    try {
      const formData = form.getValues();
      const payload = formDataToMutationPayload(formData);
      await saveOpportunity(payload);

      displayToast('Changes saved');
      form.reset(formData);
      return true;
    } catch (error) {
      displayToast('Failed to save changes. Please try again.');
      return false;
    }
  }, [form, displayToast, saveOpportunity]);

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

    // Validate the opportunity data
    const result = onValidateOpportunity({
      schema: opportunityEditStep1Schema,
    });

    if (result.error) {
      await showPrompt({
        title: labels.opportunity.requiredMissingNotice.title,
        description: (
          <div className="flex flex-col gap-4">
            <span>{labels.opportunity.requiredMissingNotice.description}</span>
            <ul className="text-text-tertiary">
              {result.error.issues.map((issue) => (
                <li key={issue.message}>• {issue.message}</li>
              ))}
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

    onSubmit({
      id: opportunity.id,
    });
  }, [
    isDirty,
    handleSave,
    onValidateOpportunity,
    showPrompt,
    onSubmit,
    opportunity?.id,
  ]);

  if (isCheckingPayment || isLoading || !opportunity) {
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

            <Button
              variant={ButtonVariant.Primary}
              color={ButtonColor.Cabbage}
              onClick={handleNextStep}
              loading={isSaving || isSubmitting || isSuccess}
            >
              <span className="mr-1.5">Outreach questions</span>
              <MoveToIcon />
            </Button>
          </header>

          <RecruiterProgress
            activeStep={RecruiterProgressStep.PrepareAndLaunch}
          />

          {/* Main content */}
          <div className="flex flex-1">
            {/* Edit Panel - 1/3 width */}
            <div className="h-[calc(100vh-112px)] w-1/3 min-w-80 max-w-md overflow-y-auto border-r border-border-subtlest-tertiary bg-background-default">
              <OpportunityCompletenessBar
                opportunity={opportunity}
                className="m-4"
              />
              <OpportunityEditPanel
                opportunity={opportunity}
                onSectionFocus={handleSectionFocus}
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

          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Small}
            onClick={handleNextStep}
            loading={isSaving || isSubmitting || isSuccess}
          >
            Next
            <MoveToIcon size={IconSize.Small} className="ml-1" />
          </Button>
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
                opportunity={opportunity}
                className="m-4"
              />
              <OpportunityEditPanel
                opportunity={opportunity}
                onSectionFocus={handleSectionFocus}
              />
            </div>
          ) : (
            <div className="bg-background-subtle py-6">
              <JobPage
                id={opportunityId}
                hideHeader
                hideCompanyBadge
                hideRecruiterBadge
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

export default PreparePage;
