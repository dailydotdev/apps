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
import { ProfileCompletionPostGate } from '@dailydotdev/shared/src/components/post/write/ProfileCompletionPostGate';
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
import { settingsUrl, webappUrl } from '@dailydotdev/shared/src/lib/constants';
import type { WriteForm } from '@dailydotdev/shared/src/contexts';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useProfileCompletionPostGate } from '@dailydotdev/shared/src/hooks/profile/useProfileCompletionPostGate';

import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons';
import { LinkWithTooltip } from '@dailydotdev/shared/src/components/tooltips/LinkWithTooltip';
import { getSquadsCreatePrefillState } from '../../lib/squadsCreatePrefill';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';

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
  const { isBlocked: isProfileBlocked, requiredPercentage } =
    useProfileCompletionPostGate();
  const {
    flags: { defaultWriteTab },
    loadedSettings,
  } = useSettingsContext();
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
    isDraftReady,
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
  const prefillState = useMemo(
    () => getSquadsCreatePrefillState(query, draft),
    [query, draft],
  );
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
    if (!user || !isRouteReady || !isDraftReady || isInitialized.current) {
      return;
    }

    isInitialized.current = true;

    if (prefillState.initialDisplay) {
      setDisplay(prefillState.initialDisplay);
    } else if (defaultWriteTab in WriteFormTab) {
      setDisplay(WriteFormTab[defaultWriteTab]);
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
    isDraftReady,
    user,
    activeSquads,
    selectedSourceIds.length,
    defaultWriteTab,
    prefillState.initialDisplay,
  ]);

  useEffect(() => {
    if (!hasCheckedPollTab && display === WriteFormTab.Poll) {
      completeAction(ActionType.SeenPostPollTab);
    }
  }, [display, hasCheckedPollTab, completeAction]);

  if (
    !isFetched ||
    !isAuthReady ||
    !isRouteReady ||
    !loadedSettings ||
    !isDraftReady
  ) {
    return <WriteFreeFormSkeleton />;
  }

  if (!user || (!activeSquads?.length && isAuthReady)) {
    return <Unauthorized />;
  }

  if (isProfileBlocked) {
    return (
      <WritePageContainer className="px-5 py-10">
        <ProfileCompletionPostGate
          className="mt-8 max-w-[36rem]"
          currentPercentage={user?.profileCompletion?.percentage}
          requiredPercentage={requiredPercentage}
          description="Add your profile details to keep post creation available."
          buttonSize={ButtonSize.Medium}
        />
      </WritePageContainer>
    );
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
          extraHeaderContent={
            !isMobile && (
              <LinkWithTooltip
                tooltip={{
                  content: (
                    <div className="max-w-48">
                      You can change the default post type settings
                    </div>
                  ),
                  placement: 'left',
                }}
                href={`${settingsUrl}/composition`}
                passHref
              >
                <Button
                  icon={<SettingsIcon />}
                  size={ButtonSize.Small}
                  className="ml-auto mr-3 self-center text-text-quaternary"
                />
              </LinkWithTooltip>
            )
          }
        >
          <Tab
            label={WriteFormTab.NewPost}
            className="flex flex-col gap-4 px-5"
          >
            {isMobile && (
              <h2 className="pt-2 font-bold typo-title3">New post</h2>
            )}
            <MultipleSourceSelect {...sourceSelectProps} />
            <WriteFreeformContent
              initialTitle={prefillState.initialDraft.title}
              initialContent={prefillState.initialDraft.content}
            />
          </Tab>
          <Tab label={WriteFormTab.Share} className="flex flex-col gap-4 px-5">
            {isMobile && (
              <h2 className="pt-2 font-bold typo-title3">Share a link</h2>
            )}
            <MultipleSourceSelect {...sourceSelectProps} />
            <ShareLink
              initialUrl={prefillState.initialShareUrl}
              initialCommentary={prefillState.initialShareCommentary}
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
