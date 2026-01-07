import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { FormProvider, useWatch } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { EDIT_OPPORTUNITY_MUTATION } from '@dailydotdev/shared/src/features/opportunity/graphql';
import type {
  Opportunity,
  ContentSection as ContentSectionType,
} from '@dailydotdev/shared/src/features/opportunity/types';
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
  formDataToPreviewOpportunity,
  formDataToMutationPayload,
  useScrollSync,
  getOpportunityStateLabel,
  getOpportunityStateBadgeClass,
} from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit';
import type {
  OpportunitySideBySideEditFormData,
  ScrollSyncSection,
} from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit';
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
import { RefreshIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { OpportunityCompletenessBar } from '@dailydotdev/shared/src/components/opportunity/OpportunityCompletenessBar';
import { OpportunityEditPanel } from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/OpportunityEditPanel';
import {
  EditPreviewTabs,
  EditPreviewTab,
} from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/EditPreviewTabs';
import { BrowserPreviewFrame } from '@dailydotdev/shared/src/components/opportunity/SideBySideEdit/BrowserPreviewFrame';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import { getLayout } from '../../../components/layouts/RecruiterFullscreenLayout';
import JobPage from '../../jobs/[id]';

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
  const [expandedSections, setExpandedSections] = useState<
    Set<ContentSectionType>
  >(new Set());

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
      // Also expand the section in the preview (without closing others)
      setExpandedSections((prev) => {
        const next = new Set(prev);
        next.add(sectionId as ContentSectionType);
        return next;
      });
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
      form.reset(formData); // Reset dirty state after successful save

      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      displayToast('Failed to save changes. Please try again.');
    }
  }, [form, displayToast, saveOpportunity]);

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
          <header className="sticky top-0 z-header flex h-14 items-center justify-between gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4 laptop:h-16">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <HeaderLogo isRecruiter />
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
          </header>

          {/* Main content */}
          <div className="flex h-[calc(100vh-64px)]">
            {/* Edit Panel - 1/3 width */}
            <div className="flex w-1/3 max-w-md flex-col overflow-y-auto border-r border-border-subtlest-tertiary bg-background-default">
              <OpportunityCompletenessBar
                opportunity={opportunity}
                className="m-4"
              />
              <OpportunityEditPanel
                opportunity={opportunity}
                onSectionFocus={handleSectionFocus}
                className="flex-1"
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
            <HeaderLogo isRecruiter />
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

          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Small}
            onClick={handleSave}
            disabled={isSaving}
          >
            {getSaveButtonText()}
          </Button>
        </header>

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

export default EditPage;
