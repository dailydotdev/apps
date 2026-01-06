import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { FormProvider } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import {
  OpportunityEditProvider,
  useOpportunityEditContext,
} from '@dailydotdev/shared/src/components/opportunity/OpportunityEditContext';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import {
  useOpportunityEditForm,
  useLocalDraft,
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

function EditPageContent(): ReactElement {
  const { opportunityId } = useOpportunityEditContext();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const [isSaved, setIsSaved] = useState(false);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [activeTab, setActiveTab] = useState<EditPreviewTab>(
    EditPreviewTab.Edit,
  );

  const { data: opportunity, isLoading } = useQuery(
    opportunityByIdOptions({ id: opportunityId }),
  );

  // Initialize form with opportunity data
  const { form, isDirty } = useOpportunityEditForm({
    opportunity,
  });

  // Local draft persistence
  const { clearDraft } = useLocalDraft({
    opportunityId,
    form,
    enabled: true,
  });

  // TODO: Implement unified save mutation in Phase 4
  const handleSave = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      displayToast('Please complete all required fields');
      return;
    }

    displayToast('Changes saved');
    setIsSaved(true);
    clearDraft();

    setTimeout(() => setIsSaved(false), 2000);
  }, [form, displayToast, clearDraft]);

  const handleUpdateFromUrl = useCallback(() => {
    openModal({
      type: LazyModal.OpportunityReimport,
      props: {
        opportunityId,
      },
    });
  }, [openModal, opportunityId]);

  const handleEditCompany = useCallback(() => {
    openModal({
      type: LazyModal.OpportunityEdit,
      props: {
        type: 'organization',
        payload: { id: opportunityId },
      },
    });
  }, [openModal, opportunityId]);

  const handleEditRecruiter = useCallback(() => {
    openModal({
      type: LazyModal.OpportunityEdit,
      props: {
        type: 'recruiter',
        payload: { id: opportunityId },
      },
    });
  }, [openModal, opportunityId]);

  const getSaveButtonText = () => {
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
                form={form}
                opportunity={opportunity}
                onEditCompany={handleEditCompany}
                onEditRecruiter={handleEditRecruiter}
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
                form={form}
                opportunity={opportunity}
                onEditCompany={handleEditCompany}
                onEditRecruiter={handleEditRecruiter}
              />
            </div>
          ) : (
            <div className="bg-background-subtle py-6">
              <JobPage
                hideHeader
                hideCompanyBadge
                hideRecruiterBadge
                previewMode
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
