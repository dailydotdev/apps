import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { FormProvider } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { updateOpportunityStateOptions } from '@dailydotdev/shared/src/features/opportunity/mutations';
import { OpportunityState } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { labels } from '@dailydotdev/shared/src/lib/labels';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import type { ContentSection as ContentSectionType } from '@dailydotdev/shared/src/features/opportunity/types';
import {
  OpportunityEditProvider,
  useOpportunityEditContext,
} from '@dailydotdev/shared/src/components/opportunity/OpportunityEditContext';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { useRequirePayment } from '@dailydotdev/shared/src/features/opportunity/hooks/useRequirePayment';
import {
  formDataToMutationPayload,
  getOpportunityStateLabel,
  getOpportunityStateBadgeClass,
  useOpportunityEditPageSetup,
} from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
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
import { RefreshIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
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
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import {
  getLayout,
  layoutProps,
} from '../../../components/layouts/RecruiterFullscreenLayout';
import JobPage from '../../jobs/[id]';

function EditPageContent(): ReactElement {
  const { opportunityId } = useOpportunityEditContext();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [activeTab, setActiveTab] = useState<EditPreviewTab>(
    EditPreviewTab.Edit,
  );
  const [expandedSections, setExpandedSections] = useState<
    Set<ContentSectionType>
  >(new Set());

  const {
    opportunity,
    liveOpportunity,
    isLoading,
    previewData,
    form,
    isSaving,
    saveOpportunity,
    handleMissingClick,
    scrollToSection,
  } = useOpportunityEditPageSetup({ opportunityId });

  const { isCheckingPayment } = useRequirePayment({
    opportunity,
    opportunityId,
  });

  // Check if there are missing required fields (edit page checks all fields including organization)
  const hasIncompleteFields = hasMissingRequiredFields(liveOpportunity);

  const onSuccess = useCallback(async () => {
    await router.push(`${webappUrl}recruiter/${opportunityId}/matches`);
  }, [router, opportunityId]);

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
        if (opportunity?.organization?.recruiterTotalSeats > 0) {
          displayToast('You need more seats to publish this job.');

          openModal({
            type: LazyModal.RecruiterSeats,
            props: {
              opportunityId,
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
                  id: opportunityId,
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

      displayToast(
        error.response?.errors?.[0]?.message || labels.error.generic,
      );
    },
  });

  // Extends the shared handleSectionFocus to also expand sections in the preview
  const handleSectionFocus = useCallback(
    (sectionId: string) => {
      scrollToSection(sectionId as ContentSectionType);
      setExpandedSections((prev) => {
        const next = new Set(prev);
        next.add(sectionId as ContentSectionType);
        return next;
      });
    },
    [scrollToSection],
  );

  // Save handler with mutation - saves and updates state to IN_REVIEW
  const handleSave = useCallback(async () => {
    try {
      const formData = form.getValues();
      const payload = formDataToMutationPayload(formData);
      await saveOpportunity(payload);

      form.reset(formData); // Reset dirty state after successful save

      // Update opportunity state to IN_REVIEW and redirect
      await updateOpportunityState({
        id: opportunityId,
        state: OpportunityState.IN_REVIEW,
      });
    } catch (error) {
      displayToast('Failed to save changes. Please try again.');
    }
  }, [
    form,
    displayToast,
    saveOpportunity,
    updateOpportunityState,
    opportunityId,
  ]);

  const handleUpdateFromUrl = useCallback(() => {
    openModal({
      type: LazyModal.OpportunityReimport,
      props: {
        opportunityId,
      },
    });
  }, [openModal, opportunityId]);

  const getSaveButtonText = () => {
    if (isSaving || isPendingOpportunityState) {
      return 'Submitting...';
    }
    return 'Submit for review';
  };

  const isSaveDisabled =
    isSaving || isPendingOpportunityState || hasIncompleteFields;

  if (isLoading || !opportunity || isCheckingPayment) {
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
          <header className="sticky top-0 z-header flex h-14 items-center justify-between gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4 laptop:h-16">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <HeaderLogo isRecruiter href="/recruiter" />
              <div className="mx-2 h-6 w-px bg-border-subtlest-tertiary" />

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
                    getOpportunityStateBadgeClass(opportunity.state),
                  )}
                >
                  {getOpportunityStateLabel(opportunity.state)}
                </span>
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

              <SimpleTooltip
                content="Complete all required fields first"
                show={hasIncompleteFields}
              >
                <div>
                  <Button
                    variant={ButtonVariant.Primary}
                    color={ButtonColor.Cabbage}
                    size={ButtonSize.Small}
                    onClick={handleSave}
                    disabled={isSaveDisabled}
                  >
                    {getSaveButtonText()}
                  </Button>
                </div>
              </SimpleTooltip>
            </div>
          </header>

          {/* Main content */}
          <div className="flex h-[calc(100vh-64px)]">
            {/* Edit Panel - 1/3 width */}
            <div className="h-full w-1/3 max-w-md overflow-y-auto border-r border-border-subtlest-tertiary bg-background-default">
              <OpportunityCompletenessBar
                opportunity={liveOpportunity}
                className="m-4"
                onMissingClick={handleMissingClick}
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
                  id={opportunityId}
                  hideHeader
                  hideCompanyBadge
                  hideRecruiterBadge
                  previewMode
                  previewData={previewData}
                  expandedSections={expandedSections}
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
        <header className="sticky top-0 z-header flex h-14 items-center justify-between gap-2 border-b border-border-subtlest-tertiary bg-background-default px-4">
          <div className="flex min-w-0 items-center gap-2">
            <HeaderLogo isRecruiter href="/recruiter" />
            <div className="mx-2 h-6 w-px bg-border-subtlest-tertiary" />

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
                getOpportunityStateBadgeClass(opportunity.state),
              )}
            >
              {getOpportunityStateLabel(opportunity.state)}
            </span>
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
                onClick={handleSave}
                disabled={isSaveDisabled}
              >
                {getSaveButtonText()}
              </Button>
            </div>
          </SimpleTooltip>
        </header>

        {/* Tab switcher */}
        <EditPreviewTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === EditPreviewTab.Edit ? (
            <div className="bg-background-default">
              <OpportunityCompletenessBar
                opportunity={liveOpportunity}
                className="m-4"
                onMissingClick={handleMissingClick}
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
                expandedSections={expandedSections}
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

EditPage.getLayout = GetPageLayout;
EditPage.layoutProps = layoutProps;

export default EditPage;
