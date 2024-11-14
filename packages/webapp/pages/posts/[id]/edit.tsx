import React, { FormEvent, ReactElement } from 'react';
import { useRouter } from 'next/router';
import {
  WriteFreeformContent,
  WritePage,
  WritePostHeader,
} from '@dailydotdev/shared/src/components/post/freeform';
import { EditPostProps, PostType } from '@dailydotdev/shared/src/graphql/posts';
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { useDiscardPost } from '@dailydotdev/shared/src/hooks/input/useDiscardPost';
import { NextSeo, NextSeoProps } from 'next-seo';
import { WritePostContextProvider } from '@dailydotdev/shared/src/contexts';
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import { ShareLink } from '@dailydotdev/shared/src/components/post/write/ShareLink';
import { useActions, usePostToSquad } from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import {
  WriteFormTab,
  WriteFormTabToFormID,
} from '@dailydotdev/shared/src/components/fields/form/common';
import { useSourcePostModerationById } from '@dailydotdev/shared/src/hooks/source/useSourcePostModerationById';
import useSourcePostModeration from '@dailydotdev/shared/src/hooks/source/useSourcePostModeration';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';

function EditPost(): ReactElement {
  const { completeAction } = useActions();
  const { query, isReady, push } = useRouter();
  const idQuery = query.id as string;
  const isModeration = query.moderation === 'true';
  const { post, isLoading } = usePostById({
    id: idQuery,
    options: { enabled: !isModeration },
  });
  const { moderated, isLoading: isModerationLoading } =
    useSourcePostModerationById({ id: idQuery, enabled: isModeration });
  const { squads, user } = useAuthContext();
  const formId =
    post?.type === PostType.Share
      ? WriteFormTabToFormID[WriteFormTab.Share]
      : WriteFormTabToFormID[WriteFormTab.NewPost];
  const squad = squads?.find(({ id, handle }) =>
    [id, handle].includes((post || moderated)?.source?.id),
  );
  const fetchedPost = post || moderated;
  const isVerified = verifyPermission(squad, SourcePermissions.Post);
  const { displayToast } = useToastNotification();
  const {
    onAskConfirmation,
    draft,
    updateDraft,
    isDraftReady,
    isUpdatingDraft,
    formRef,
    clearDraft,
  } = useDiscardPost({ post: fetchedPost });
  const { onEditFreeformPost, isPosting, isSuccess } = usePostToSquad({
    onPostSuccess: async (data) => {
      onAskConfirmation(false);
      clearDraft();
      await push(data.commentsPermalink);

      if (data.type === PostType.Welcome) {
        completeAction(ActionType.EditWelcomePost);
      }
    },
    onSourcePostModerationSuccess: async (data) => {
      clearDraft();
      await push(data.source.permalink);
    },
    onError: (data: ApiErrorResult) => {
      if (data?.response?.errors?.[0]) {
        displayToast(data?.response?.errors?.[0].message);
      }
      onAskConfirmation(true);
    },
  });

  const { onUpdatePostModeration, isPending } = useSourcePostModeration({
    onSuccess: async () => {
      onAskConfirmation(false);
      clearDraft();
      push(squad.permalink);
    },
  });
  const onClickSubmit = (
    e: FormEvent<HTMLFormElement>,
    params: EditPostProps,
  ) => {
    if (isPosting || isPending || isSuccess) {
      return null;
    }

    if (moderated) {
      const { title, content, image } = params;
      return onUpdatePostModeration({
        type: PostType.Freeform,
        title,
        content,
        image,
        id: moderated.id,
        sourceId: squad.id,
      });
    }

    return onEditFreeformPost({ ...params, id: post.id }, squad);
  };

  const seo: NextSeoProps = {
    title: `Edit - ${post?.title ?? ''} | ${post?.source?.name}`,
    openGraph: { ...defaultOpenGraph },
    titleTemplate: '%s | daily.dev',
    ...defaultSeo,
  };

  const isAuthor =
    post?.author.id === user?.id || moderated?.createdBy?.id === user?.id;

  const canEdit = (() => {
    if (isAuthor) {
      return true;
    }

    if (post?.type !== PostType.Welcome) {
      return false;
    }

    return verifyPermission(squad, SourcePermissions.WelcomePostEdit);
  })();

  const isLoadingPage =
    !fetchedPost &&
    (!isReady || isLoading || isModerationLoading || !isDraftReady);

  return (
    <WritePostContextProvider
      post={post}
      moderated={moderated}
      draft={draft}
      squad={squad}
      fetchedPost={fetchedPost}
      formRef={formRef}
      isUpdatingDraft={isUpdatingDraft}
      isPosting={isPosting || isSuccess}
      updateDraft={updateDraft}
      onSubmitForm={onClickSubmit}
      formId={formId}
      enableUpload
    >
      <NextSeo {...seo} noindex nofollow />
      <WritePage
        isEdit
        isLoading={isLoadingPage}
        isForbidden={!isVerified || !squad || !canEdit}
      >
        <WritePostHeader isEdit />
        {fetchedPost?.type === PostType.Share ? (
          <ShareLink
            post={post}
            moderated={moderated}
            squad={squad}
            className="px-4 py-6"
            onPostSuccess={() => {
              onAskConfirmation(false);
              push(squad.permalink);
            }}
          />
        ) : (
          <WriteFreeformContent className="px-4 py-6" />
        )}
      </WritePage>
    </WritePostContextProvider>
  );
}

EditPost.getLayout = getMainLayout;

export default EditPost;
