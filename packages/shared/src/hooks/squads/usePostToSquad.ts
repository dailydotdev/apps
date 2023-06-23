import {
  UseMutateAsyncFunction,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from 'react-query';
import { BaseSyntheticEvent, useCallback, useState } from 'react';
import {
  ExternalLinkPreview,
  getExternalLinkPreview,
  Post,
  SubmitExternalLink,
  submitExternalLink,
} from '../../graphql/posts';
import { ApiError, ApiErrorResult, getApiError } from '../../graphql/common';
import { useToastNotification } from '../useToastNotification';
import { addPostToSquad } from '../../graphql/squads';
import { ActionType } from '../../graphql/actions';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { useRequestProtocol } from '../useRequestProtocol';

interface UsePostToSquad {
  preview: ExternalLinkPreview;
  isPosting: boolean;
  isLoadingPreview: boolean;
  onUpdatePreview: (preview: ExternalLinkPreview) => void;
  getLinkPreview: UseMutateAsyncFunction<
    ExternalLinkPreview,
    ApiErrorResult,
    string
  >;
  onSubmitPost: (
    e: BaseSyntheticEvent,
    sourceId: string,
    commentary: string,
  ) => Promise<unknown>;
}

interface UsePostToSquadProps {
  callback?: Pick<
    UseMutationOptions<ExternalLinkPreview, ApiErrorResult, string>,
    'onSuccess' | 'onError'
  >;
  onPostSuccess?: (post: Post, url: string) => void;
  initialPreview?: ExternalLinkPreview;
}

const DEFAULT_ERROR = 'An error occurred, please try again';

export const usePostToSquad = ({
  callback,
  onPostSuccess,
  initialPreview,
}: UsePostToSquadProps = {}): UsePostToSquad => {
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { completeAction } = useActions();
  const [preview, setPreview] = useState(initialPreview);
  const { requestMethod } = useRequestProtocol();
  const { mutateAsync: getLinkPreview, isLoading: isLoadingPreview } =
    useMutation((url: string) => getExternalLinkPreview(url, requestMethod), {
      onSuccess: (...params) => {
        const [result, url] = params;
        setPreview({ ...result, url });

        if (callback?.onSuccess) callback.onSuccess(...params);
      },
      onError: (err: ApiErrorResult, link, ...params) => {
        const rateLimited = getApiError(err, ApiError.RateLimited);
        const message = rateLimited?.message ?? DEFAULT_ERROR;
        displayToast(message);
        callback?.onError?.(err, link, ...params);
      },
    });

  const onSharedPostSuccessfully = async () => {
    displayToast('This post has been shared to your Squad');
    await client.invalidateQueries(['sourceFeed', user.id]);
    completeAction(ActionType.SquadFirstPost);
  };

  const {
    mutateAsync: onPost,
    isLoading: isPostLoading,
    isSuccess: isPostSuccess,
  } = useMutation(addPostToSquad(requestMethod), {
    onSuccess: (data) => {
      onSharedPostSuccessfully();
      if (onPostSuccess) onPostSuccess(data, data?.permalink);
    },
  });

  const {
    mutateAsync: onSubmitLink,
    isLoading: isLinkLoading,
    isSuccess: isLinkSuccess,
  } = useMutation(
    (params: SubmitExternalLink) => submitExternalLink(params, requestMethod),
    {
      onSuccess: (_, { url }) => {
        onSharedPostSuccessfully();
        if (onPostSuccess) onPostSuccess(null, url);
      },
    },
  );

  const isPosting =
    isPostLoading || isLinkLoading || isPostSuccess || isLinkSuccess;

  const onSubmitPost = useCallback(
    (e: BaseSyntheticEvent, sourceId: string, commentary: string) => {
      e.preventDefault();

      if (isPosting) return null;

      if (preview.id) {
        return onPost({
          id: preview.id,
          sourceId,
          commentary,
        });
      }

      const { title, image, url } = preview;

      if (!title) {
        displayToast('Invalid link');
        return null;
      }

      return onSubmitLink({
        url,
        title,
        image,
        sourceId,
        commentary,
      });
    },
    [preview, displayToast, onSubmitLink, onPost, isPosting],
  );

  return {
    isLoadingPreview,
    getLinkPreview,
    onSubmitPost,
    isPosting,
    preview,
    onUpdatePreview: setPreview,
  };
};
