import React, { FormEvent, ReactElement, useState } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import {
  WritePage,
  WritePageContainer,
} from '@dailydotdev/shared/src/components/post/freeform';
import { useMutation } from 'react-query';
import { createPost } from '@dailydotdev/shared/src/graphql/posts';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useDiscardPost } from '@dailydotdev/shared/src/hooks/input/useDiscardPost';
import { WritePostContext } from '@dailydotdev/shared/src/contexts';
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import { ShareLink } from '@dailydotdev/shared/src/components/post/write';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seo: NextSeoProps = {
  title: 'Create post',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

enum WriteFormTab {
  Share = 'Share a link',
  NewPost = 'New post',
}

function CreatePost(): ReactElement {
  const { query, isReady, push } = useRouter();
  const { squads } = useAuthContext();
  const squad = squads?.find(({ id, handle }) =>
    [id, handle].includes(query?.handle as string),
  );
  const [display, setDisplay] = useState(WriteFormTab.Share);
  const isVerified = verifyPermission(squad, SourcePermissions.Post);
  const { displayToast } = useToastNotification();
  const {
    onAskConfirmation,
    draft,
    updateDraft,
    isDraftReady,
    formRef,
    clearDraft,
  } = useDiscardPost({ draftIdentifier: squad?.id });
  const {
    mutateAsync: onCreatePost,
    isLoading: isPosting,
    isSuccess,
  } = useMutation(createPost, {
    onMutate: () => {
      onAskConfirmation(false);
    },
    onSuccess: async (post) => {
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
    if (isPosting || isSuccess) return null;

    return onCreatePost({ ...params, sourceId: squad.id });
  };

  return (
    <WritePostContext.Provider
      value={{
        draft,
        updateDraft,
        formRef,
        onSubmitForm: onClickSubmit,
        squad,
        isPosting: isPosting || isSuccess,
        enableUpload: true,
      }}
    >
      <WritePageContainer>
        <NextSeo {...seo} titleTemplate="%s | daily.dev" />
        <TabContainer<WriteFormTab>
          onActiveChange={(active) => setDisplay(active)}
          controlledActive={display}
          shouldMountInactive
        >
          <Tab label={WriteFormTab.Share} className="px-6">
            <ShareLink squad={squad} />
          </Tab>
          <Tab label={WriteFormTab.NewPost}>
            <WritePage
              isLoading={!isReady || !isDraftReady}
              isForbidden={!isVerified || !squad}
            >
              Test
            </WritePage>
          </Tab>
        </TabContainer>
      </WritePageContainer>
    </WritePostContext.Provider>
  );
}

CreatePost.getLayout = getMainLayout;

export default CreatePost;
