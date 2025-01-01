import type { FormEvent, ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import {
  WriteFreeformContent,
  WriteFreeFormSkeleton,
  WritePageContainer,
} from '@dailydotdev/shared/src/components/post/freeform';
import type { CreatePostProps } from '@dailydotdev/shared/src/graphql/posts';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useDiscardPost } from '@dailydotdev/shared/src/hooks/input/useDiscardPost';
import { WritePostContextProvider } from '@dailydotdev/shared/src/contexts';
import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import { ShareLink } from '@dailydotdev/shared/src/components/post/write/ShareLink';
import {
  generateDefaultSquad,
  SquadsDropdown,
} from '@dailydotdev/shared/src/components/post/write';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import {
  useActions,
  usePostToSquad,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { useSquadCreate } from '@dailydotdev/shared/src/hooks/squads/useSquadCreate';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import {
  WriteFormTab,
  WriteFormTabToFormID,
} from '@dailydotdev/shared/src/components/fields/form/common';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Create post'),
  openGraph: { ...defaultOpenGraph },
  nofollow: true,
  noindex: true,
  ...defaultSeo,
};

function CreatePost(): ReactElement {
  const { completeAction } = useActions();
  const { push, isReady: isRouteReady, query } = useRouter();
  const { squads, user, isAuthReady, isFetched } = useAuthContext();
  const [selected, setSelected] = useState(-1);
  const activeSquads = useMemo(() => {
    const collator = new Intl.Collator('en');
    const filtered = squads
      ?.filter(
        (squadItem) =>
          squadItem?.active &&
          verifyPermission(squadItem, SourcePermissions.Post),
      )
      .sort((a, b) => collator.compare(a.name, b.name));

    if (!user) {
      return filtered;
    }

    return [
      ...filtered,
      {
        ...generateDefaultSquad(user.username),
        name: 'Create new Squad',
        handle: null,
      },
    ];
  }, [squads, user]);
  const squad = activeSquads?.[selected];
  const [display, setDisplay] = useState(WriteFormTab.NewPost);
  const { displayToast } = useToastNotification();
  const isMobile = useViewSize(ViewSize.MobileL);
  const isTablet = useViewSize(ViewSize.Tablet);
  const {
    onAskConfirmation,
    draft,
    updateDraft,
    formRef,
    clearDraft,
    isUpdatingDraft,
  } = useDiscardPost({ draftIdentifier: squad?.id });
  const onPostSuccess = async (link: string) => {
    onAskConfirmation(false);
    clearDraft();
    completeAction(ActionType.SquadFirstPost);
    await push(link);
  };
  const { onSubmitFreeformPost, isPosting, isSuccess } = usePostToSquad({
    onPostSuccess: async (data) => {
      onPostSuccess(data.commentsPermalink);
    },
    onSourcePostModerationSuccess: async (data) => {
      onPostSuccess(data.source.permalink);
    },
    onError: (data: ApiErrorResult) => {
      if (data?.response?.errors?.[0]) {
        displayToast(data?.response?.errors?.[0].message);
      }
      onAskConfirmation(true);
    },
  });
  const { onCreateSquad, isLoading } = useSquadCreate({
    onSuccess: (newSquad) => {
      const form = formToJson<CreatePostProps>(formRef.current);

      return onSubmitFreeformPost(form, newSquad);
    },
    retryWithRandomizedHandle: true,
  });

  const param = isRouteReady && activeSquads?.length && (query.sid as string);
  const shareParam = query.share as string;

  useEffect(() => {
    if (!param) {
      return;
    }

    const preselected = activeSquads.findIndex(({ id, handle }) =>
      [id, handle].includes(param),
    );
    setSelected((value) => (value >= 0 ? value : preselected));
  }, [activeSquads, param]);

  useEffect(() => {
    if (!shareParam) {
      return;
    }

    setDisplay(WriteFormTab.Share);
  }, [shareParam]);

  const onClickSubmit = async (e: FormEvent<HTMLFormElement>, params) => {
    e.preventDefault();
    if (isPosting || isSuccess || isLoading) {
      return null;
    }

    if (!squad) {
      displayToast('Select a Squad to post to!');
      return null;
    }

    if (squads.some(({ id }) => squad.id === id)) {
      return onSubmitFreeformPost(params, squad);
    }

    await onCreateSquad(generateDefaultSquad(user.username));

    return null;
  };

  if (!isFetched || !isAuthReady || !isRouteReady) {
    return <WriteFreeFormSkeleton />;
  }

  if (!user || (!activeSquads?.length && isAuthReady)) {
    return <Unauthorized />;
  }

  return (
    <WritePostContextProvider
      draft={draft}
      squad={squad}
      formRef={formRef}
      isUpdatingDraft={isUpdatingDraft}
      isPosting={isPosting || isSuccess || isLoading}
      updateDraft={updateDraft}
      onSubmitForm={onClickSubmit}
      formId={WriteFormTabToFormID[display]}
      enableUpload
    >
      <WritePageContainer>
        <TabContainer<WriteFormTab>
          onActiveChange={(active) => setDisplay(active)}
          controlledActive={display}
          shouldMountInactive
          className={{ header: 'px-1' }}
          showHeader={isTablet}
        >
          <Tab label={WriteFormTab.NewPost} className="px-5">
            {isMobile && (
              <h2 className="pt-2 font-bold typo-title3">New post</h2>
            )}
            <SquadsDropdown
              list={activeSquads}
              onSelect={setSelected}
              selected={selected}
            />
            <WriteFreeformContent className="mt-6" />
          </Tab>
          <Tab label={WriteFormTab.Share} className="px-5">
            {isMobile && (
              <h2 className="pt-2 font-bold typo-title3">Share a link</h2>
            )}
            <SquadsDropdown
              list={activeSquads}
              onSelect={setSelected}
              selected={selected}
            />
            <ShareLink
              squad={squad}
              className="mt-4"
              onPostSuccess={() => {
                onAskConfirmation(false);
              }}
            />
          </Tab>
        </TabContainer>
      </WritePageContainer>
    </WritePostContextProvider>
  );
}

CreatePost.getLayout = getMainLayout;
CreatePost.layoutProps = { seo };

export default CreatePost;
