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
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

function EditPost(): ReactElement {
  const { query, isReady, push } = useRouter();
  const { post, isFetched } = usePostById({ id: query.id as string });
  const { squads, user } = useAuthContext();
  const squad = squads?.find(({ id, handle }) =>
    [id, handle].includes(post?.source?.id),
  );
  const { displayToast } = useToastNotification();
  const { onAskConfirmation } = useDiscardPost({ post });
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

    const data = formToJson<CreatePostProps>(e.currentTarget);

    return onCreatePost({ ...data, id: post.id });
  };

  return (
    <WritePage
      isEdit
      isPosting={isPosting}
      onSubmitForm={onClickSubmit}
      isLoading={!isReady || !isFetched}
      isForbidden={post?.author.id !== user?.id}
      squad={squad}
      post={post}
    />
  );
}

EditPost.getLayout = getMainLayout;

export default EditPost;
