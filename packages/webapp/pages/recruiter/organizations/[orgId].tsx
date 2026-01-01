import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type z from 'zod';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { OrganizationEditForm } from '@dailydotdev/shared/src/components/organization/OrganizationEditForm';
import { getOpportunitiesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { RequestKey } from '@dailydotdev/shared/src/lib/query';
import {
  updateRecruiterOrganizationMutationOptions,
  clearRecruiterOrganizationImageMutationOptions,
} from '@dailydotdev/shared/src/features/opportunity/mutations';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { labels } from '@dailydotdev/shared/src/lib';
import type { recruiterOrganizationEditSchema } from '@dailydotdev/shared/src/features/organizations/schema';
import { getLayout } from '../../../components/layouts/RecruiterSelfServeLayout';

const EditOrganizationPage = (): ReactElement => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { orgId } = router.query;
  const { user, isAuthReady } = useAuthContext();
  const { displayToast } = useToastNotification();

  // Fetch all opportunities to find the organization
  const { data: opportunitiesData, isLoading } = useQuery({
    ...getOpportunitiesOptions(),
    enabled: !!user && isAuthReady,
  });

  // Find the organization from opportunities
  const organization = useMemo(() => {
    if (!opportunitiesData?.edges || !orgId) {
      return null;
    }

    const opportunity = opportunitiesData.edges.find(
      (edge) => edge.node.organization?.id === orgId,
    );

    return opportunity?.node.organization || null;
  }, [opportunitiesData, orgId]);

  const { mutateAsync, isPending } = useMutation({
    ...updateRecruiterOrganizationMutationOptions(),
    onSuccess: () => {
      // Invalidate opportunities query to update sidebar
      queryClient.invalidateQueries({
        queryKey: [RequestKey.Opportunities],
      });
      displayToast('Organization updated successfully');
    },
  });

  const { mutateAsync: clearImageMutation } = useMutation({
    ...clearRecruiterOrganizationImageMutationOptions(),
  });

  const handleSubmit = async (
    data: z.infer<typeof recruiterOrganizationEditSchema>,
    imageFile: File | null,
    shouldClearImage: boolean,
  ) => {
    if (!orgId || typeof orgId !== 'string') {
      displayToast('Invalid organization ID');
      return;
    }

    try {
      // Clear image first if requested
      if (shouldClearImage) {
        await clearImageMutation({ id: orgId });
      }

      await mutateAsync({
        id: orgId,
        payload: data,
        organizationImage: imageFile || undefined,
      });
    } catch (originalError) {
      if (
        originalError.response?.errors?.[0]?.extensions?.code ===
        ApiError.ZodValidationError
      ) {
        displayToast('Validation error. Please check your input.');
      } else {
        displayToast(
          originalError.response?.errors?.[0]?.message || labels.error.generic,
        );
      }

      throw originalError;
    }
  };

  const handleCancel = () => {
    router.reload();
  };

  if (!isAuthReady) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Typography
          type={TypographyType.Title2}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          Organization not found or you don&apos;t have access to edit it.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-4xl p-6">
        <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float">
          <OrganizationEditForm
            organization={organization}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
            stickyHeaderActions
            header={
              <Typography type={TypographyType.Title2} bold>
                Edit Company Information
              </Typography>
            }
          />
        </div>
      </div>
    </div>
  );
};

EditOrganizationPage.getLayout = getLayout;

export default EditOrganizationPage;
