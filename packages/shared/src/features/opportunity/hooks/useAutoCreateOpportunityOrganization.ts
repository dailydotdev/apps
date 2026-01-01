import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { opportunityByIdOptions } from '../queries';
import { createOrganizationForOpportunityMutationOptions } from '../mutations';
import { RequestKey } from '../../../lib/query';
import type { Opportunity } from '../types';

/**
 * Hook that automatically creates an organization for an opportunity
 * if one doesn't exist. Uses a ref to prevent duplicate creation attempts.
 */
export const useAutoCreateOpportunityOrganization = (
  opportunity: Opportunity | undefined | null,
): void => {
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const creatingOrgRef = useRef(false);

  const { mutate: createDefaultOrg } = useMutation({
    ...createOrganizationForOpportunityMutationOptions(),
    onSuccess: () => {
      // The API already assigns the organization to the opportunity,
      // so we just need to refetch the opportunity data
      queryClient.invalidateQueries({
        queryKey: opportunityByIdOptions({ id: opportunity?.id ?? '' })
          .queryKey,
      });
      // Invalidate opportunities query to update sidebar
      queryClient.invalidateQueries({
        queryKey: [RequestKey.Opportunities],
      });
      creatingOrgRef.current = false;
    },
    onError: () => {
      creatingOrgRef.current = false;
      displayToast('Failed to create organization. Please refresh the page.');
    },
  });

  // Auto-create organization with default settings if not present (api generates unique name)
  useEffect(() => {
    if (!opportunity) {
      return;
    }

    if (!opportunity.organization && !creatingOrgRef.current) {
      creatingOrgRef.current = true;
      createDefaultOrg({
        opportunityId: opportunity.id,
      });
    }
  }, [opportunity, createDefaultOrg]);
};
