import React, { FormEventHandler, ReactElement } from 'react';
import { useRouter } from 'next/router';
import { useSquad } from '@dailydotdev/shared/src/hooks';
import { WritePage } from '@dailydotdev/shared/src/components/post/freeform';
import { useMutation } from 'react-query';
import {
  createPost,
  CreatePostProps,
} from '@dailydotdev/shared/src/graphql/posts';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

function CreatePost(): ReactElement {
  const { query, isReady, push } = useRouter();
  const { squad, isForbidden, isLoading, isFetched } = useSquad({
    handle: query?.handle as string,
  });
  const { displayToast } = useToastNotification();
  const { mutateAsync: onCreatePost, isLoading: isPosting } = useMutation(
    createPost,
    {
      onSuccess: async (post) => {
        await push(post.commentsPermalink);
      },
      onError: (data: ApiErrorResult) => {
        if (data?.response?.errors?.[0]) {
          displayToast(data?.response?.errors?.[0].message);
        }
      },
    },
  );

  const onClickSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (isPosting) return null;

    const data = formToJson<CreatePostProps>(e.currentTarget);

    return onCreatePost({ ...data, sourceId: squad.id });
  };

  return (
    <WritePage
      onSubmitForm={onClickSubmit}
      isLoading={isLoading || !isReady || !isFetched}
      isForbidden={isForbidden}
      squad={squad}
    />
  );
}

CreatePost.getLayout = getMainLayout;

export default CreatePost;
