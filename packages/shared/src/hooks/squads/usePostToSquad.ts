import {
  UseMutateAsyncFunction,
  useMutation,
  UseMutationOptions,
} from 'react-query';
import { useMemo } from 'react';
import {
  ExternalLinkPreview,
  getExternalLinkPreview,
  getPostByUrl,
  Post,
} from '../../graphql/posts';
import { ApiError, ApiErrorResult, getApiError } from '../../graphql/common';
import { useToastNotification } from '../useToastNotification';

interface UsePostToSquad {
  isLoadingPreview: boolean;
  isCheckingPost: boolean;
  getPreview: UseMutateAsyncFunction<
    ExternalLinkPreview,
    ApiErrorResult,
    string
  >;
  getPost: UseMutateAsyncFunction<Post, ApiErrorResult, string>;
}

interface UsePostToSquadProps {
  onEmptyUrl?: (url: string) => Promise<null>;
  previewCallback?: Pick<
    UseMutationOptions<ExternalLinkPreview, ApiErrorResult, string>,
    'onSuccess' | 'onError'
  >;
  postCallback?: Pick<
    UseMutationOptions<Post, ApiErrorResult, string>,
    'onSuccess' | 'onError'
  >;
}

const allowedSubmissionErrors = [ApiError.NotFound, ApiError.Forbidden];
const DEFAULT_ERROR = 'An error occurred, please try again';

export const usePostToSquad = ({
  onEmptyUrl,
  previewCallback,
  postCallback,
}: UsePostToSquadProps): UsePostToSquad => {
  const { displayToast } = useToastNotification();
  const { mutateAsync: getPrivateLink, isLoading: isLoadingPreview } =
    useMutation(getExternalLinkPreview, {
      onSuccess: previewCallback?.onSuccess,
      onError: (err: ApiErrorResult, link, ...params) => {
        const rateLimited = getApiError(err, ApiError.RateLimited);

        displayToast(rateLimited?.message ?? DEFAULT_ERROR);

        previewCallback?.onError?.(err, link, ...params);
      },
    });

  const { mutateAsync: getPost, isLoading: isCheckingPost } = useMutation(
    getPostByUrl,
    {
      onSuccess: postCallback?.onSuccess,
      onError: async (err: ApiErrorResult, link, ...params) => {
        if (allowedSubmissionErrors.some((code) => getApiError(err, code))) {
          getPrivateLink(link);
        }

        await postCallback?.onError?.(err, link, ...params);
      },
    },
  );

  return useMemo(
    () => ({
      isLoadingPreview,
      isCheckingPost,
      getPreview: getPrivateLink,
      getPost: (url) => {
        if (url === '') return onEmptyUrl(url);

        return getPost(url);
      },
    }),
    [previewCallback, getPost, onEmptyUrl, isLoadingPreview, isCheckingPost],
  );
};
