import React, { FormEvent, ReactElement } from 'react';
import { useRouter } from 'next/router';
import {
  WriteFreeformContent,
  WritePage,
  WritePostHeader,
} from '@dailydotdev/shared/src/components/post/freeform';
import { editPost, PostType } from '@dailydotdev/shared/src/graphql/posts';
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useMutation } from 'react-query';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { useDiscardPost } from '@dailydotdev/shared/src/hooks/input/useDiscardPost';
import { NextSeo, NextSeoProps } from 'next-seo';
import { WritePostContext } from '@dailydotdev/shared/src/contexts';
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';

function EditPost(): ReactElement {
  const { query, isReady, push } = useRouter();
  const { post, isFetched } = usePostById({ id: query.id as string });
  const { squads, user } = useAuthContext();
  const squad = squads?.find(({ id, handle }) =>
    [id, handle].includes(post?.source?.id),
  );
  const isVerified = verifyPermission(squad, SourcePermissions.Post);
  const { displayToast } = useToastNotification();
  const {
    onAskConfirmation,
    draft,
    updateDraft,
    isDraftReady,
    formRef,
    clearDraft,
  } = useDiscardPost({ post });
  const {
    mutateAsync: onUpdatePost,
    isLoading: isPosting,
    isSuccess,
  } = useMutation(editPost, {
    onMutate: () => {
      onAskConfirmation(false);
    },
    onSuccess: async () => {
      clearDraft();
      await push(post.commentsPermalink);
    },
    onError: (data: ApiErrorResult) => {
      if (data?.response?.errors?.[0]) {
        displayToast(data?.response?.errors?.[0].message);
      }
      onAskConfirmation(true);
    },
  });

  const onClickSubmit = (e: FormEvent<HTMLFormElement>, params) => {
    if (isPosting || isSuccess) {
      return null;
    }

    return onUpdatePost({ ...params, id: post.id });
  };

  const seo: NextSeoProps = {
    title: `Edit - ${post?.title ?? ''} | ${post?.source?.name}`,
    openGraph: { ...defaultOpenGraph },
    titleTemplate: '%s | daily.dev',
    ...defaultSeo,
  };

  const isAuthor = post?.author.id === user?.id;

  const canEdit = (() => {
    if (isAuthor) {
      return true;
    }

    if (post?.type !== PostType.Welcome) {
      return false;
    }

    return verifyPermission(squad, SourcePermissions.WelcomePostEdit);
  })();

  return (
    <WritePostContext.Provider
      value={{
        updateDraft,
        onSubmitForm: onClickSubmit,
        formRef,
        draft,
        squad,
        post,
        isPosting: isPosting || isSuccess,
        enableUpload: true,
      }}
    >
      <NextSeo {...seo} />
      <WritePage
        isLoading={!isReady || !isFetched || !isDraftReady}
        isForbidden={!isVerified || !squad || !canEdit}
      >
        <WritePostHeader isEdit />
        <WriteFreeformContent className="py-6 px-4" />
      </WritePage>
    </WritePostContext.Provider>
  );
}

EditPost.getLayout = getMainLayout;

export default EditPost;
