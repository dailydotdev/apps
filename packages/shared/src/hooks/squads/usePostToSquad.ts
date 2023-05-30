import {
  UseMutateAsyncFunction,
  useMutation,
  UseMutationOptions,
} from 'react-query';
import { useMemo } from 'react';
import {
  ExternalLinkPreview,
  getExternalLinkPreview,
} from '../../graphql/posts';
import { ApiError, ApiErrorResult, getApiError } from '../../graphql/common';
import { useToastNotification } from '../useToastNotification';

interface UsePostToSquad {
  isLoadingPreview: boolean;
  getLinkPreview: UseMutateAsyncFunction<
    ExternalLinkPreview,
    ApiErrorResult,
    string
  >;
}

interface UsePostToSquadProps {
  onEmptyUrl?: () => Promise<null>;
  callback?: Pick<
    UseMutationOptions<ExternalLinkPreview, ApiErrorResult, string>,
    'onSuccess' | 'onError'
  >;
}

const DEFAULT_ERROR = 'An error occurred, please try again';

export const usePostToSquad = ({
  onEmptyUrl,
  callback,
}: UsePostToSquadProps): UsePostToSquad => {
  const { displayToast } = useToastNotification();
  const { mutateAsync: getLinkPreview, isLoading: isLoadingPreview } =
    useMutation(getExternalLinkPreview, {
      onSuccess: callback?.onSuccess,
      onError: (err: ApiErrorResult, link, ...params) => {
        const rateLimited = getApiError(err, ApiError.RateLimited);
        const message = rateLimited?.message ?? DEFAULT_ERROR;
        displayToast(message);
        callback?.onError?.(err, link, ...params);
      },
    });

  return useMemo(
    () => ({
      isLoadingPreview,
      getLinkPreview: (url) => {
        if (url === '') return onEmptyUrl();

        return getLinkPreview(url);
      },
    }),
    [getLinkPreview, onEmptyUrl, isLoadingPreview],
  );
};
