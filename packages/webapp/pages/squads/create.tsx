import type { FormEvent, ReactElement } from 'react';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import {
  WriteFreeformContent,
  WriteFreeFormSkeleton,
  WritePageContainer,
} from '@dailydotdev/shared/src/components/post/freeform';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
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
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import {
  useActions,
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
import type { WriteForm } from '@dailydotdev/shared/src/contexts';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
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
  const { defaultWriteTab } = useSettingsContext();
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
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
  } = useDiscardPost({ draftIdentifier: selectedSourceIds?.join('-') });
  const clearFormOnSuccess = () => {
    onAskConfirmation(false);
    clearDraft();
    completeAction(ActionType.SquadFirstPost);
  };
  const clearFormAndRedirectTo = async (link: string) => {
    clearFormOnSuccess();
    await push(link);
  };

  const isInitialized = useRef(false);
  const sourceSelectProps = {
    selectedSourceIds,
    setSelectedSourceIds,
    className: 'mt-6',
  };
  const { onCreate, isPending } = useMultipleSourcePost({
    onSuccess: async (result) => {
      const postedInUserSource = selectedSourceIds.includes(user?.id);
      if (postedInUserSource) {
        client.refetchQueries({
          queryKey: ['author', user.id],
        });
      }

      const postLabel = result.length > 1 ? 'posts have' : 'post has';

      // if every source is moderated, just show the success message
      const isEveryItemPending = result.every(
        (item) => item.type === 'moderationItem',
      );
      if (isEveryItemPending) {
        displayToast(`✅ Your ${postLabel} been submitted for moderation`);
        clearFormOnSuccess();
        return;
      }

      displayToast(`✅ Your ${postLabel} been created!`);

      // only one source, let's redirect to the post
      const isSingleSourcePost = selectedSourceIds.length === 1;
      if (isSingleSourcePost) {
        const { slug, id } = result[0];
        await clearFormAndRedirectTo(`${webappUrl}posts/${slug || id}`);
        return;
      }

      // more than one source and at least one is not moderation
      await clearFormAndRedirectTo(`${webappUrl}${user?.username}/posts/`);
    },
    onError: (data) => {
      if (data?.response?.errors?.[0]) {
        displayToast(data?.response?.errors?.[0].message);
      }
      onAskConfirmation(true);
    },
  });

  const onClickSubmit = async (
    e: FormEvent<HTMLFormElement>,
    params: Omit<WriteForm, 'image'> & { image?: File },
  ) => {
    e.preventDefault();

    if (isPending || !selectedSourceIds.length) {
      return;
    }

    const { options, ...args } = params;

    await onCreate({
      ...args,
      ...(options?.length && {
        options: options.map((text, order) => ({
          text,
          order,
        })),
      }),
      sourceIds: selectedSourceIds,
    });
  };

  const initialSelected = !!activeSquads?.length && (query.sid as string);
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
    } else {
      // Use the default tab from settings if no query param is present
      setDisplay(defaultWriteTab || WriteFormTab.NewPost);
    }

    const preselectedSquad =
      initialSelected &&
      activeSquads.find(({ id, handle }) =>
        [id, handle].includes(initialSelected),
      );

    setSelectedSourceIds((value) => {
      // if we already have a value, don't change it
      if (value.length) {
        return value;
      }

      // If there is a ?sid= param, we want to preselect the squad
      if (preselectedSquad) {
        return [preselectedSquad.id];
      }

      // Otherwise we want to preselect the "Everyone" option
      return [user.id];
    });
  }, [
    initialSelected,
    isRouteReady,
    user,
    activeSquads,
    selectedSourceIds.length,
    query,
    defaultWriteTab,
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

  return (
    <WritePostContextProvider
      draft={draft}
      squad={null}
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
              onPostSuccess={() => {
                onAskConfirmation(false);
              }}
              isPostingOnMySource={selectedSourceIds.includes(user.id)}
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
