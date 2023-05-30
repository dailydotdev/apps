import React, { FormEventHandler, ReactElement } from 'react';
import { useRouter } from 'next/router';
import { del as deleteCache } from 'idb-keyval';
import {
  generateWritePostKey,
  WritePage,
} from '@dailydotdev/shared/src/components/post/freeform';
import {
  CreatePostProps,
  editPost,
} from '@dailydotdev/shared/src/graphql/posts';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useMutation } from 'react-query';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { useDiscardPost } from '@dailydotdev/shared/src/hooks/input/useDiscardPost';
import { NextSeo, NextSeoProps } from 'next-seo';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';

function EditPost(): ReactElement {
  const { query, isReady, push } = useRouter();
  const { post, isFetched } = usePostById({ id: query.id as string });
  const { squads, user } = useAuthContext();
  const squad = squads?.find(({ id, handle }) =>
    [id, handle].includes(post?.source?.id),
  );
  const { displayToast } = useToastNotification();
  const { onAskConfirmation, draft, updateDraft, isDraftReady, formRef } =
    useDiscardPost({ post });
  const { mutateAsync: onCreatePost, isLoading: isPosting } = useMutation(
    editPost,
    {
      onMutate: () => {
        onAskConfirmation(false);
      },
      onSuccess: async () => {
        const key = generateWritePostKey(post.id);
        await deleteCache(key);
        await push(post.commentsPermalink);
      },
      onError: (data: ApiErrorResult) => {
        if (data?.response?.errors?.[0]) {
          displayToast(data?.response?.errors?.[0].message);
        }
        onAskConfirmation(true);
      },
    },
  );

  const onClickSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (isPosting) return null;

    const data = formToJson<CreatePostProps & { image: File[] }>(
      e.currentTarget,
    );
    const image = data.image ? data.image[0] : null;

    return onCreatePost({ ...data, image, id: post.id });
  };

  const seo: NextSeoProps = {
    title: `Edit - ${post?.title ?? ''} | ${post?.source?.name}`,
    openGraph: { ...defaultOpenGraph },
    titleTemplate: '%s | daily.dev',
    ...defaultSeo,
  };

  return (
    <>
      <NextSeo {...seo} />
      <WritePage
        isEdit
        formRef={formRef}
        isPosting={isPosting}
        onSubmitForm={onClickSubmit}
        isLoading={!isReady || !isFetched || !isDraftReady}
        isForbidden={post?.author.id !== user?.id}
        squad={squad}
        post={post}
        draft={draft}
        updateDraft={updateDraft}
      />
    </>
  );
}

EditPost.getLayout = getMainLayout;

export default EditPost;
