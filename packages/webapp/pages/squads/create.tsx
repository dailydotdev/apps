import type { FormEvent, ReactElement } from 'react';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import {
  WriteFreeformContent,
  WriteFreeFormSkeleton,
  WritePageContainer,
} from '@dailydotdev/shared/src/components/post/freeform';
import type {
  CreatePostPollProps,
  CreatePostProps,
  Post,
} from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
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
  generateUserSourceAsSquad,
  MultipleSourceSelect,
} from '@dailydotdev/shared/src/components/post/write';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import {
  isSourceUserSource,
  SourcePermissions,
} from '@dailydotdev/shared/src/graphql/sources';
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
import { useQueryClient } from '@tanstack/react-query';
import CreatePoll from '@dailydotdev/shared/src/components/post/poll/CreatePoll';
import { Pill, PillSize } from '@dailydotdev/shared/src/components/Pill';
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
  const { isActionsFetched, completeAction, checkHasCompleted } = useActions();
  const hasCheckedPollTab = useMemo(
    () => checkHasCompleted(ActionType.SeenPostPollTab),
    [checkHasCompleted],
  );
  const { push, isReady: isRouteReady, query } = useRouter();
  const { squads, user, isAuthReady, isFetched } = useAuthContext();
  const client = useQueryClient();
  const [selected, setSelected] = useState([]);
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
  const { onSubmitFreeformPost, onSubmitPollPost, isPosting, isSuccess } =
    usePostToSquad({
      onPostSuccess: async (post) => {
        const isUserSource = isSourceUserSource(post.source);

        if (isUserSource) {
          client.refetchQueries({
            queryKey: ['author', user.id],
          });
        }

        onPostSuccess(post.commentsPermalink);
      },
      onSourcePostModerationSuccess: async (post) => {
        onPostSuccess(post.source.permalink);
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

  const initialSelected = activeSquads?.length && (query.sid as string);

  const isInitialized = useRef(false);
  useEffect(() => {
    // Only run this once after router and user are ready
    if (!user || !isRouteReady || isInitialized.current) {
      return;
    }

    isInitialized.current = true;

    const { share: isInitialShare, poll: isInitialPoll } = query;
    if (isInitialShare) {
      setDisplay(WriteFormTab.Share);
    } else if (isInitialPoll) {
      setDisplay(WriteFormTab.Poll);
    }

    if (initialSelected) {
      // If there is a ?sid= param, we want to preselect the squad
      const preselected = activeSquads.find(({ id, handle }) =>
        [id, handle].includes(initialSelected),
      );
      setSelected((value) => {
        return value.length && preselected ? value : [preselected.id];
      });
    } else if (!selected.length && user) {
      // If there is no ?sid= param, we want to preselect the user
      setSelected([user.id]);
    }
  }, [
    initialSelected,
    isRouteReady,
    user,
    activeSquads,
    selected.length,
    query,
  ]);

  const onClickSubmit = async (
    e: FormEvent<HTMLFormElement>,
    params: CreatePostProps | CreatePostPollProps,
    type: Post['type'],
  ) => {
    e.preventDefault();
    if (isPosting || isSuccess || isLoading) {
      return null;
    }

    if (!squad) {
      return type === PostType.Freeform
        ? onSubmitFreeformPost(params, generateUserSourceAsSquad(user))
        : onSubmitPollPost(
            params as CreatePostPollProps,
            generateUserSourceAsSquad(user),
          );
    }

    if (squads.some(({ id }) => squad.id === id)) {
      return type === PostType.Freeform
        ? onSubmitFreeformPost(params, squad)
        : onSubmitPollPost(params as CreatePostPollProps, squad);
    }

    await onCreateSquad(generateDefaultSquad(user.username));

    return null;
  };

  const sourceSelectProps = { selected, setSelected, className: 'mt-6' };

  useEffect(() => {
    if (!hasCheckedPollTab && display === WriteFormTab.Poll) {
      completeAction(ActionType.SeenPostPollTab);
    }
  }, [display, hasCheckedPollTab, completeAction]);

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
          <Tab
            label={WriteFormTab.NewPost}
            className="flex flex-col gap-4 px-5"
          >
            {isMobile && (
              <h2 className="pt-2 font-bold typo-title3">New post</h2>
            )}
            <MultipleSourceSelect {...sourceSelectProps} />
            <WriteFreeformContent />
          </Tab>
          <Tab label={WriteFormTab.Share} className="flex flex-col gap-4 px-5">
            {isMobile && (
              <h2 className="pt-2 font-bold typo-title3">Share a link</h2>
            )}
            <MultipleSourceSelect {...sourceSelectProps} />
            <ShareLink
              squad={squad}
              onPostSuccess={() => {
                onAskConfirmation(false);
              }}
            />
          </Tab>
          <Tab
            label={WriteFormTab.Poll}
            className="flex flex-col gap-4 px-5"
            hint={
              display !== WriteFormTab.Poll &&
              isActionsFetched &&
              !hasCheckedPollTab ? (
                <Pill
                  label="New"
                  size={PillSize.XSmall}
                  className="mt-0.5 bg-brand-float text-brand-default"
                />
              ) : undefined
            }
          >
            {isMobile && <h2 className="pt-2 font-bold typo-title3">Poll</h2>}
            <MultipleSourceSelect {...sourceSelectProps} />
            <CreatePoll />
          </Tab>
        </TabContainer>
      </WritePageContainer>
    </WritePostContextProvider>
  );
}

CreatePost.getLayout = getMainLayout;
CreatePost.layoutProps = { seo };

export default CreatePost;
