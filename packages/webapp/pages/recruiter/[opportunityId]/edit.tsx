import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { FormProvider, useWatch } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { EDIT_OPPORTUNITY_MUTATION } from '@dailydotdev/shared/src/features/opportunity/graphql';
import type { Opportunity } from '@dailydotdev/shared/src/features/opportunity/types';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import {
  OpportunityEditProvider,
  useOpportunityEditContext,
} from '@dailydotdev/shared/src/components/opportunity/OpportunityEditContext';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import {
  useOpportunityEditForm,
  useLocalDraft,
  formDataToPreviewOpportunity,
  useScrollSync,
} from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit';
import type { OpportunitySideBySideEditFormData } from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/hooks/useOpportunityEditForm';
import type { ScrollSyncSection } from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/hooks/useScrollSync';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useExitConfirmation } from '@dailydotdev/shared/src/hooks/useExitConfirmation';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
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
import {
  ArrowIcon,
  RefreshIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { OpportunityState } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import { OpportunityCompletenessBar } from '@dailydotdev/shared/src/components/opportunity/OpportunityCompletenessBar';
import { OpportunityEditPanel } from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/OpportunityEditPanel';
import {
  EditPreviewTabs,
  EditPreviewTab,
} from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/EditPreviewTabs';
import { BrowserPreviewFrame } from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/BrowserPreviewFrame';
import { getLayout } from '../../../components/layouts/RecruiterSelfServeLayout';
import JobPage from '../../jobs/[id]';

function getStateLabel(state: OpportunityState): string {
  switch (state) {
    case OpportunityState.DRAFT:
      return 'DRAFT';
    case OpportunityState.LIVE:
      return 'LIVE';
    case OpportunityState.CLOSED:
      return 'CLOSED';
    case OpportunityState.IN_REVIEW:
      return 'IN REVIEW';
    default:
      return 'DRAFT';
  }
}

function getStateBadgeClass(state: OpportunityState): string {
  switch (state) {
    case OpportunityState.DRAFT:
      return 'bg-status-warning text-white';
    case OpportunityState.LIVE:
      return 'bg-status-success text-white';
    case OpportunityState.CLOSED:
      return 'bg-text-disabled text-white';
    case OpportunityState.IN_REVIEW:
      return 'bg-status-info text-white';
    default:
      return 'bg-status-warning text-white';
  }
}

/**
 * Transform form data to GraphQL mutation payload
 */
function formDataToMutationPayload(
  formData: OpportunitySideBySideEditFormData,
) {
  return {
    title: formData.title,
    tldr: formData.tldr,
    keywords: formData.keywords,
    meta: {
      employmentType: formData.meta.employmentType,
      teamSize: formData.meta.teamSize,
      salary: formData.meta.salary
        ? {
            min: formData.meta.salary.min,
            max: formData.meta.salary.max,
            period: formData.meta.salary.period,
          }
        : undefined,
      seniorityLevel: formData.meta.seniorityLevel,
      roleType: formData.meta.roleType,
    },
    content: {
      overview: formData.content.overview?.content || '',
      responsibilities: formData.content.responsibilities?.content || '',
      requirements: formData.content.requirements?.content || '',
      whatYoullDo: formData.content.whatYoullDo?.content || undefined,
      interviewProcess: formData.content.interviewProcess?.content || undefined,
    },
  };
}

function EditPageContent(): ReactElement {
  const { opportunityId } = useOpportunityEditContext();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [activeTab, setActiveTab] = useState<EditPreviewTab>(
    EditPreviewTab.Edit,
  );

  const { data: opportunity, isLoading } = useQuery(
    opportunityByIdOptions({ id: opportunityId }),
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

  // Local draft persistence
  const { clearDraft, lastSaved } = useLocalDraft({
    opportunityId,
    form,
    enabled: true,
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

  // Save handler with mutation
  const handleSave = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      displayToast('Please complete all required fields');
      return;
    }

    try {
      const formData = form.getValues();
      const payload = formDataToMutationPayload(formData);
      await saveOpportunity(payload);

      displayToast('Changes saved');
      setIsSaved(true);
      clearDraft();
      form.reset(formData); // Reset dirty state after successful save

      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      displayToast('Failed to save changes. Please try again.');
    }
  }, [form, displayToast, clearDraft, saveOpportunity]);

  const handleUpdateFromUrl = useCallback(() => {
    openModal({
      type: LazyModal.OpportunityReimport,
      props: {
        opportunityId,
      },
    });
  }, [openModal, opportunityId]);

  const getSaveButtonText = () => {
    if (isSaving) {
      return 'Saving...';
    }
    if (isSaved && !isDirty) {
      return 'Saved';
    }
    return 'Save';
  };

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
          <div className="flex items-center justify-between gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Link href={`${webappUrl}recruiter`}>
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={
                    <ArrowIcon className="rotate-180" size={IconSize.Small} />
                  }
                >
                  Dashboard
                </Button>
              </Link>

              <div className="flex min-w-0 items-center gap-2">
                <Typography
                  type={TypographyType.Body}
                  color={TypographyColor.Primary}
                  className="truncate"
                  bold
                >
                  {form.watch('title') || opportunity.title || 'Untitled Job'}
                </Typography>

                <span
                  className={classNames(
                    'rounded shrink-0 px-2 py-0.5 text-xs font-bold',
                    getStateBadgeClass(opportunity.state),
                  )}
                >
                  {getStateLabel(opportunity.state)}
                </span>

                {isDirty && lastSaved && (
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Quaternary}
                    className="shrink-0"
                  >
                    Draft saved
                  </Typography>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                onClick={handleUpdateFromUrl}
                icon={<RefreshIcon size={IconSize.Small} />}
              >
                Re-import
              </Button>

              <Button
                variant={ButtonVariant.Primary}
                color={ButtonColor.Cabbage}
                size={ButtonSize.Small}
                onClick={handleSave}
                disabled={isSaving}
              >
                {getSaveButtonText()}
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-1">
            {/* Edit Panel - 1/3 width */}
            <div className="h-[calc(100vh-57px)] w-1/3 min-w-80 max-w-md overflow-y-auto border-r border-border-subtlest-tertiary bg-background-default">
              <OpportunityCompletenessBar
                opportunity={opportunity}
                className="m-4"
              />
              <OpportunityEditPanel
                opportunity={opportunity}
                onSectionFocus={handleSectionFocus}
              />
            </div>

            {/* Preview Panel - 2/3 width - uses existing JobPage */}
            <div className="flex-1 overflow-y-auto bg-background-subtle p-6">
              <BrowserPreviewFrame
                url={`${
                  typeof window !== 'undefined' ? window.location.origin : ''
                }/jobs/${opportunityId}`}
                className="h-full"
              >
                <JobPage
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
        <div className="flex items-center justify-between gap-2 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link href={`${webappUrl}recruiter`}>
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={
                  <ArrowIcon className="rotate-180" size={IconSize.Small} />
                }
              />
            </Link>

            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              className="truncate"
              bold
            >
              {form.watch('title') || opportunity.title || 'Untitled'}
            </Typography>

            <span
              className={classNames(
                'rounded shrink-0 px-1.5 py-0.5 text-xs font-bold',
                getStateBadgeClass(opportunity.state),
              )}
            >
              {getStateLabel(opportunity.state)}
            </span>
          </div>

          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Small}
            onClick={handleSave}
            disabled={isSaving}
          >
            {getSaveButtonText()}
          </Button>
        </div>

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

function EditPage(): ReactElement {
  return <EditPageContent />;
}

const GetPageLayout = (
  page: ReactNode,
  pageProps: Record<string, unknown>,
): ReactNode => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  const { opportunityId } = router.query;

  return (
    <OpportunityEditProvider opportunityId={opportunityId as string} allowDraft>
      {getLayout(page, pageProps)}
    </OpportunityEditProvider>
  );
};

EditPage.getLayout = GetPageLayout;

export default EditPage;
