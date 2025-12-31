import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { opportunityByIdOptions } from '../queries';
import { editOpportunityOrganizationMutationOptions } from '../mutations';
import type { Opportunity } from '../types';

/**
 * Hook that automatically creates an organization for an opportunity
 * if one doesn't exist. Uses a ref to prevent duplicate creation attempts.
 */
export const useAutoCreateOpportunityOrganization = (
  opportunity: Opportunity | undefined | null,
): void => {
  const { displayToast } = useToastNotification();
  const creatingOrgRef = useRef(false);

  const [, updateOpportunity] = useUpdateQuery(
    opportunityByIdOptions({ id: opportunity?.id ?? '' }),
  );

  const { mutate: createDefaultOrg } = useMutation({
    ...editOpportunityOrganizationMutationOptions(),
    onSuccess: (result) => {
      updateOpportunity(result);
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
        id: opportunity.id,
        payload: { organization: {} },
      });
    }
  }, [opportunity, createDefaultOrg]);
};
