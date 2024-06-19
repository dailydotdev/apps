import {
  UseMutateAsyncFunction,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { BaseSyntheticEvent, useCallback, useState } from 'react';
import {
  ExternalLinkPreview,
  getExternalLinkPreview,
  Post,
  SubmitExternalLink,
  submitExternalLink,
} from '../../graphql/posts';
import {
  ApiError,
  ApiErrorResult,
  DEFAULT_ERROR,
  getApiError,
} from '../../graphql/common';
import { useToastNotification } from '../useToastNotification';
import { addPostToSquad, updateSquadPost } from '../../graphql/squads';
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
  onUpdatePost: (
    e: BaseSyntheticEvent,
    postId: Post['id'],
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

        if (callback?.onSuccess) {
          callback.onSuccess(...params);
        }
      },
      onError: (err: ApiErrorResult, link, ...params) => {
        const rateLimited = getApiError(err, ApiError.RateLimited);
        const message = rateLimited?.message ?? DEFAULT_ERROR;
        displayToast(message);
        callback?.onError?.(err, link, ...params);
      },
    });

  const onSharedPostSuccessfully = async (update = false) => {
    displayToast(
      update
        ? 'The post has been updated'
        : 'This post has been shared to your squad',
    );
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
      if (onPostSuccess) {
        onPostSuccess(data, data?.permalink);
      }
    },
  });

  const {
    mutateAsync: updatePost,
    isLoading: isUpdatePostLoading,
    isSuccess: isUpdatePostSuccess,
  } = useMutation(updateSquadPost(requestMethod), {
    onSuccess: (data) => {
      onSharedPostSuccessfully(true);
      if (onPostSuccess) {
        onPostSuccess(data, data?.permalink);
      }
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
        if (onPostSuccess) {
          onPostSuccess(null, url);
        }
      },
    },
  );

  const isPosting =
    isPostLoading || isLinkLoading || isPostSuccess || isLinkSuccess;

  const isUpdating = isUpdatePostSuccess || isUpdatePostLoading;

  const onSubmitPost = useCallback<UsePostToSquad['onSubmitPost']>(
    (e, sourceId, commentary) => {
      e?.preventDefault();

      if (isPosting) {
        return null;
      }

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

  const onUpdatePost = useCallback<UsePostToSquad['onUpdatePost']>(
    (e, postId, commentary) => {
      e.preventDefault();

      if (isUpdating) {
        return null;
      }

      return updatePost({
        id: postId,
        commentary,
      });
    },
    [updatePost, isUpdating],
  );

  return {
    isLoadingPreview,
    getLinkPreview,
    onSubmitPost,
    onUpdatePost,
    isPosting,
    preview,
    onUpdatePreview: setPreview,
  };
};
