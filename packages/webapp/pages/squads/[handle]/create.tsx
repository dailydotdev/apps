import React, { FormEventHandler, ReactElement } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { del as deleteCache } from 'idb-keyval';
import {
  generateWritePostKey,
  WritePage,
} from '@dailydotdev/shared/src/components/post/freeform';
import { useMutation } from 'react-query';
import { createPost } from '@dailydotdev/shared/src/graphql/posts';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useDiscardPost } from '@dailydotdev/shared/src/hooks/input/useDiscardPost';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';

const seo: NextSeoProps = {
  title: 'Create post',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

function CreatePost(): ReactElement {
  const { query, isReady, push } = useRouter();
  const { squads } = useAuthContext();
  const squad = squads?.find(({ id, handle }) =>
    [id, handle].includes(query?.handle as string),
  );
  const { displayToast } = useToastNotification();
  const { onAskConfirmation, draft, updateDraft, isDraftReady, formRef } =
    useDiscardPost();
  const { mutateAsync: onCreatePost, isLoading: isPosting } = useMutation(
    createPost,
    {
      onMutate: () => {
        onAskConfirmation(false);
      },
      onSuccess: async (post) => {
        const key = generateWritePostKey();
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

    const { title, content, image: files } = formToJson(e.currentTarget);
    const image = files ? files[0] : null;

    return onCreatePost({ title, content, image, sourceId: squad.id });
  };

  return (
    <>
      <NextSeo {...seo} titleTemplate="%s | daily.dev" />
      <WritePage
        onSubmitForm={onClickSubmit}
        isLoading={!isReady || !isDraftReady}
        isPosting={isPosting}
        formRef={formRef}
        squad={squad}
        draft={draft}
        updateDraft={updateDraft}
      />
    </>
  );
}

CreatePost.getLayout = getMainLayout;

export default CreatePost;
