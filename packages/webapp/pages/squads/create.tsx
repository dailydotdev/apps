import type { FormEvent, ReactElement } from 'react';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import {
  WriteFreeformContent,
  WriteFreeFormSkeleton,
  WritePageContainer,
} from '@dailydotdev/shared/src/components/post/freeform';
import type { CreatePostInMultipleSourcesArgs } from '@dailydotdev/shared/src/graphql/posts';
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
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import {
  WriteFormTab,
  WriteFormTabToFormID,
} from '@dailydotdev/shared/src/components/fields/form/common';
import { useQueryClient } from '@tanstack/react-query';
import CreatePoll from '@dailydotdev/shared/src/components/post/poll/CreatePoll';
import { Pill, PillSize } from '@dailydotdev/shared/src/components/Pill';
import { useMultipleSourcePost } from '@dailydotdev/shared/src/features/squads/hooks/useMultipleSourcePost';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
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
  const client = useQueryClient();
  const { isActionsFetched, completeAction, checkHasCompleted } = useActions();
  const hasCheckedPollTab = useMemo(
    () => checkHasCompleted(ActionType.SeenPostPollTab),
    [checkHasCompleted],
  );
  const { push, isReady: isRouteReady, query } = useRouter();
  const { squads, user, isAuthReady, isFetched } = useAuthContext();
  const [selected, setSelected] = useState<string[]>([]);
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
  } = useDiscardPost({ draftIdentifier: selected?.join('-') });
  const clearFormOnSuccess = () => {
    onAskConfirmation(false);
    clearDraft();
    completeAction(ActionType.SquadFirstPost);
  };
  const onPostSuccess = async (link: string) => {
    clearFormOnSuccess();
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

  const isInitialized = useRef(false);
  const sourceSelectProps = { selected, setSelected, className: 'mt-6' };
  const { onCreate, isPending } = useMultipleSourcePost({});

  const onClickSubmit = async (
    e: FormEvent<HTMLFormElement>,
    params: Omit<CreatePostInMultipleSourcesArgs, 'options'> &
      Record<'options', string[]>,
  ) => {
    e.preventDefault();

    console.log({ e, params, selected });

    if (isPending) {
      return;
    }

    const result = await onCreate({
      ...params,
      ...(params.options?.length && {
        options: params.options.map((text, order) => ({
          text,
          order,
        })),
      }),
      sourceIds: selected.map((id) => id),
    });

    if (!result) {
      return;
    }

    clearDraft();

    const postedInUserSource = selected.includes(user?.id);
    if (postedInUserSource) {
      client.refetchQueries({
        queryKey: ['author', user.id],
      });
    }

    const isOnlyModerationRequired = result.every(
      (item) => item.type === 'moderationItem',
    );
    if (isOnlyModerationRequired) {
      displayToast(
        `✅ Your ${
          result.length > 1 ? 'posts have' : 'post has'
        } been submitted for moderation`,
      );
      clearFormOnSuccess();
      return;
    }

    const isSingleSourcePost = selected.length === 1;
    if (isSingleSourcePost) {
      await onPostSuccess(`${webappUrl}posts/${result[0].slug}`);
    }

    await onPostSuccess(`${webappUrl}${user?.username}/posts/`);
    console.log({ result });
  };

  const initialSelected = activeSquads?.length && (query.sid as string);
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

  const squad = activeSquads.find(({ id }) => id === selected[0]);

  return (
    <WritePostContextProvider
      draft={draft}
      squad={squad}
      formRef={formRef}
      isUpdatingDraft={isUpdatingDraft}
      isPosting={isPending}
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
