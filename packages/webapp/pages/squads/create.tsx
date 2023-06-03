import React, { FormEvent, ReactElement, useState } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import {
  WriteFreeformContent,
  WriteFreeFormSkeleton,
  WritePageContainer,
} from '@dailydotdev/shared/src/components/post/freeform';
import { useMutation } from 'react-query';
import { createPost } from '@dailydotdev/shared/src/graphql/posts';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useDiscardPost } from '@dailydotdev/shared/src/hooks/input/useDiscardPost';
import { WritePostContext } from '@dailydotdev/shared/src/contexts';
import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import {
  ShareLink,
  SquadsDropdown,
} from '@dailydotdev/shared/src/components/post/write';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
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
  const { push } = useRouter();
  const { squads, user, isAuthReady, isFetched } = useAuthContext();
  const [selected, setSelected] = useState(-1);
  const squad = squads?.[selected];
  const [display, setDisplay] = useState(WriteFormTab.Share);
  const { displayToast } = useToastNotification();
  const {
    onAskConfirmation,
    draft,
    updateDraft,
    formRef,
    clearDraft,
    isUpdatingDraft,
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

    if (!squad) {
      displayToast('Select a Squad to post to!');
      return null;
    }

    return onCreatePost({ ...params, sourceId: squad.id });
  };

  if (!isFetched || !isAuthReady) return <WriteFreeFormSkeleton />;

  if (!user || (!squads?.length && isAuthReady)) return <Unauthorized />;

  return (
    <WritePostContext.Provider
      value={{
        draft,
        updateDraft,
        formRef,
        isUpdatingDraft,
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
          className={{ header: 'px-1' }}
        >
          <Tab label={WriteFormTab.Share} className="px-5">
            <SquadsDropdown onSelect={setSelected} selected={selected} />
            <ShareLink
              squad={squad}
              className="mt-4"
              onPostSuccess={() => push(squad.permalink)}
            />
          </Tab>
          <Tab label={WriteFormTab.NewPost} className="px-5">
            <SquadsDropdown onSelect={setSelected} selected={selected} />
            <WriteFreeformContent className="mt-6" />
          </Tab>
        </TabContainer>
      </WritePageContainer>
    </WritePostContext.Provider>
  );
}

CreatePost.getLayout = getMainLayout;

export default CreatePost;
