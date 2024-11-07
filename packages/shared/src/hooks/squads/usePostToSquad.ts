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
  PostType,
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
import useSourcePostModeration from '../source/useSourcePostModeration';
import { Squad } from '../../graphql/sources';
import { moderationRequired } from '../../components/squads/utils';

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
    squad: Squad,
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
  const { mutateAsync: getLinkPreview, isPending: isLoadingPreview } =
    useMutation({
      mutationFn: (url: string) => getExternalLinkPreview(url, requestMethod),
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
  const { onCreatePostModeration, isSuccess: isCreatingPostModeration } =
    useSourcePostModeration({
      onSuccess: () => {
        // TODO: Will implement moderation modal popup in MI-583
      },
      onError: () => {
        displayToast(DEFAULT_ERROR);
      },
    });

  const onSharedPostSuccessfully = async (update = false) => {
    displayToast(
      update
        ? 'The post has been updated'
        : 'This post has been shared to your squad',
    );
    await client.invalidateQueries({
      queryKey: ['sourceFeed', user.id],
    });
    completeAction(ActionType.SquadFirstPost);
  };

  const {
    mutateAsync: onPost,
    isPending: isPostLoading,
    isSuccess: isPostSuccess,
  } = useMutation({
    mutationFn: addPostToSquad(requestMethod),
    onSuccess: (data) => {
      onSharedPostSuccessfully();
      if (onPostSuccess) {
        onPostSuccess(data, data?.permalink);
      }
    },
  });

  const {
    mutateAsync: updatePost,
    isPending: isUpdatePostLoading,
    isSuccess: isUpdatePostSuccess,
  } = useMutation({
    mutationFn: updateSquadPost(requestMethod),
    onSuccess: (data) => {
      onSharedPostSuccessfully(true);
      if (onPostSuccess) {
        onPostSuccess(data, data?.permalink);
      }
    },
  });

  const {
    mutateAsync: onSubmitLink,
    isPending: isLinkLoading,
    isSuccess: isLinkSuccess,
  } = useMutation({
    mutationFn: (params: SubmitExternalLink) =>
      submitExternalLink(params, requestMethod),
    onSuccess: (_, { url }) => {
      onSharedPostSuccessfully();
      if (onPostSuccess) {
        onPostSuccess(null, url);
      }
    },
  });

  const isPosting =
    isPostLoading ||
    isLinkLoading ||
    isPostSuccess ||
    isLinkSuccess ||
    isCreatingPostModeration;

  const isUpdating = isUpdatePostSuccess || isUpdatePostLoading;

  const onSubmitPost = useCallback<UsePostToSquad['onSubmitPost']>(
    (e, squad, commentary) => {
      e?.preventDefault();
      if (isPosting) {
        return null;
      }

      if (preview.id) {
        return moderationRequired(squad)
          ? onCreatePostModeration({
              type: PostType.Share,
              sourceId: squad.id,
              sharedPostId: preview.id,
              externalLink: preview?.url,
              commentary,
            })
          : onPost({
              id: preview.id,
              sourceId: squad.id,
              commentary,
            });
      }

      const { title, image, url } = preview;

      if (!title) {
        displayToast('Invalid link');
        return null;
      }

      return moderationRequired(squad)
        ? onCreatePostModeration({
            externalLink: url,
            title,
            imageUrl: image,
            type: PostType.Share,
            sourceId: squad.id,
            commentary,
          })
        : onSubmitLink({
            url,
            title,
            image,
            sourceId: squad.id,
            commentary,
          });
    },
    [
      preview,
      displayToast,
      onSubmitLink,
      onPost,
      isPosting,
      onCreatePostModeration,
    ],
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
