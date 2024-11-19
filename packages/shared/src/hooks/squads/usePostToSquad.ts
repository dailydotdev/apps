import {
  UseMutateAsyncFunction,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { BaseSyntheticEvent, useCallback, useState } from 'react';
import {
  createPost,
  CreatePostProps,
  editPost,
  EditPostProps,
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
import {
  addPostToSquad,
  SourcePostModeration,
  updateSquadPost,
} from '../../graphql/squads';
import { ActionType } from '../../graphql/actions';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { useRequestProtocol } from '../useRequestProtocol';
import useSourcePostModeration from '../source/useSourcePostModeration';
import { Squad } from '../../graphql/sources';
import { moderationRequired } from '../../components/squads/utils';

interface UsePostToSquad {
  preview: ExternalLinkPreview;
  isSuccess: boolean;
  isPosting: boolean;
  isLoadingPreview: boolean;
  onUpdatePreview: (preview: ExternalLinkPreview) => void;
  getLinkPreview: UseMutateAsyncFunction<
    ExternalLinkPreview,
    ApiErrorResult,
    string
  >;
  onEditFreeformPost: (
    editedPost: EditPostProps,
    squad: Squad,
  ) => Promise<void>;
  onSubmitPost: (
    e: BaseSyntheticEvent,
    squad: Squad,
    commentary: string,
  ) => Promise<unknown>;
  onSubmitFreeformPost: (post: CreatePostProps, squad: Squad) => Promise<void>;
  onUpdateSharePost: (
    e: BaseSyntheticEvent,
    postId: Post['id'],
    commentary: string,
    squad: Squad,
  ) => Promise<unknown>;
}

interface UsePostToSquadProps {
  onPostSuccess?: (post: Post, url: string) => void;
  onSourcePostModerationSuccess?: (data: SourcePostModeration) => void;
  onExternalLinkSuccess?: (data: ExternalLinkPreview, url: string) => void;
  initialPreview?: ExternalLinkPreview;
  onMutate?: (data) => void;
  onError?: (error: ApiErrorResult) => void;
}

export const usePostToSquad = ({
  onPostSuccess,
  onMutate,
  onError,
  onExternalLinkSuccess,
  onSourcePostModerationSuccess,
  initialPreview,
}: UsePostToSquadProps = {}): UsePostToSquad => {
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { completeAction } = useActions();
  const [preview, setPreview] = useState(initialPreview);
  const { requestMethod } = useRequestProtocol();

  const {
    mutateAsync: onCreatePost,
    isPending: isLoadingFreeform,
    isSuccess: isFreeformPostSuccess,
  } = useMutation({
    mutationFn: createPost,
    onMutate,
    onError,
    onSuccess: onPostSuccess,
  });
  const {
    mutateAsync: editPostMutation,
    isPending: isEditLoading,
    isSuccess: isEditPostSuccess,
  } = useMutation({
    mutationFn: editPost,
    onMutate,
    onSuccess: onPostSuccess,
    onError,
  });

  const { mutateAsync: getLinkPreview, isPending: isLoadingPreview } =
    useMutation({
      mutationFn: (url: string) => getExternalLinkPreview(url, requestMethod),
      onSuccess: (data, url) => {
        setPreview({ ...data, url });
        onExternalLinkSuccess?.(data, url);
      },
      onError: (err: ApiErrorResult) => {
        const rateLimited = getApiError(err, ApiError.RateLimited);
        const message = rateLimited?.message ?? DEFAULT_ERROR;
        displayToast(message);
        onError?.(err);
      },
    });

  const {
    onCreatePostModeration,
    isSuccess: isPostModerationSuccess,
    isPending: isPostModerationLoading,
  } = useSourcePostModeration({
    onSuccess: (data) => {
      completeAction(ActionType.SquadFirstPost);
      onSourcePostModerationSuccess?.(data);
    },
    onError: () => {
      displayToast(DEFAULT_ERROR);
    },
  });

  const onEditFreeformPost = useCallback<UsePostToSquad['onEditFreeformPost']>(
    async (editedPost: EditPostProps, squad: Squad): Promise<void> => {
      if (isEditLoading || isEditPostSuccess) {
        return null;
      }

      if (moderationRequired(squad)) {
        onCreatePostModeration({
          ...editedPost,
          type: PostType.Freeform,
          postId: editedPost.id,
          sourceId: squad.id,
        });
      } else {
        editPostMutation(editedPost);
      }
      return null;
    },
    [
      editPostMutation,
      onCreatePostModeration,
      isEditLoading,
      isEditPostSuccess,
    ],
  );

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
    isPostModerationLoading ||
    isEditLoading ||
    isLoadingFreeform;

  const isUpdating =
    isUpdatePostSuccess || isUpdatePostLoading || isPostModerationLoading;

  const isSuccess =
    isPostModerationSuccess ||
    isPostSuccess ||
    isLinkSuccess ||
    isFreeformPostSuccess ||
    isEditPostSuccess;

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
              title: commentary,
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
            content: commentary,
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

  const onUpdateSharePost = useCallback<UsePostToSquad['onUpdateSharePost']>(
    (e, postId, commentary, squad) => {
      e.preventDefault();

      if (isUpdating) {
        return null;
      }

      return moderationRequired(squad)
        ? onCreatePostModeration({
            postId,
            type: PostType.Share,
            sourceId: squad.id,
            title: commentary,
          })
        : updatePost({
            id: postId,
            commentary,
          });
    },
    [updatePost, isUpdating, onCreatePostModeration],
  );

  const onSubmitFreeformPost = useCallback<
    UsePostToSquad['onSubmitFreeformPost']
  >(
    (post: CreatePostProps, squad: Squad) => {
      if (moderationRequired(squad)) {
        onCreatePostModeration({
          ...post,
          sourceId: squad.id,
          type: PostType.Freeform,
        });
      } else {
        onCreatePost({ ...post, sourceId: squad.id });
      }
      return null;
    },
    [onCreatePost, onCreatePostModeration],
  );

  return {
    isLoadingPreview,
    getLinkPreview,
    onSubmitPost,
    onUpdateSharePost,
    isPosting,
    onEditFreeformPost,
    preview,
    isSuccess,
    onSubmitFreeformPost,
    onUpdatePreview: setPreview,
  };
};
