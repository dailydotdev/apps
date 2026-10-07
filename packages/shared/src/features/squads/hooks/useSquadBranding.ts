import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import type {
  SquadBranding,
  UpdateSquadBrandingInput,
} from '../../../graphql/squadBranding';
import {
  squadBrandingQueryOptions,
  updateSquadBranding,
} from '../../../graphql/squadBranding';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { labels } from '../../../lib/labels';
import type {
  ApiErrorResult,
  ApiResponseError,
  ApiZodErrorExtension,
} from '../../../graphql/common';
import { ApiError, getApiError } from '../../../graphql/common';
import { getSquadId } from '../lib/features';

const fieldNames: Record<string, string> = {
  color: 'Brand colour',
  label: 'Button label',
  url: 'Link',
};

/** The API's own reason when it rejects a save, else the generic error. */
export const getBrandingErrorMessage = (error: unknown): string => {
  const result = error as ApiErrorResult;
  const zod = getApiError(result, ApiError.ZodValidationError) as
    | ApiResponseError<ApiZodErrorExtension>
    | undefined;
  const issue = zod?.extensions?.issues?.[0];

  if (issue) {
    const field = String(issue.path[issue.path.length - 1] ?? '');
    return fieldNames[field]
      ? `${fieldNames[field]}: ${issue.message}`
      : issue.message;
  }

  return result?.response?.errors?.[0]?.message ?? labels.error.generic;
};

/** A verified squad's branding; undefined for others or while loading. */
export const useSquadBranding = (squad: Squad): SquadBranding | undefined => {
  const { user } = useAuthContext();
  const { data } = useQuery(squadBrandingQueryOptions({ squad, user }));

  return data;
};

export const useUpdateSquadBranding = (squad: Squad) => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { displayToast } = useToastNotification();

  return useMutation({
    mutationFn: (input: Omit<UpdateSquadBrandingInput, 'sourceId'>) =>
      updateSquadBranding({ ...input, sourceId: getSquadId(squad) }),
    onSuccess: (branding) => {
      client.setQueryData(
        squadBrandingQueryOptions({ squad, user }).queryKey,
        branding,
      );
      displayToast('The branding has been updated');
    },
    onError: (error) => displayToast(getBrandingErrorMessage(error)),
  });
};
