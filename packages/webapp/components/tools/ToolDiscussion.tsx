import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation } from '@tanstack/react-query';
import { initToolDiscussion } from '@dailydotdev/shared/src/graphql/tools';
import { usePostById } from '@dailydotdev/shared/src/hooks/usePostById';
import type { NewCommentRef } from '@dailydotdev/shared/src/components/post/NewComment';
import { NewComment } from '@dailydotdev/shared/src/components/post/NewComment';
import { PostComments } from '@dailydotdev/shared/src/components/post/PostComments';
import PlaceholderCommentList from '@dailydotdev/shared/src/components/comments/PlaceholderCommentList';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { useUserCompaniesQuery } from '@dailydotdev/shared/src/hooks/userCompany/useUserCompaniesQuery';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';

const CommentInputOrModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "commentInputOrModal" */ '@dailydotdev/shared/src/components/comments/CommentInputOrModal'
    ),
);

interface ToolDiscussionProps {
  toolId: string;
  toolTitle: string;
  discussionPostId: string | null;
}

const VERIFIED_GATE_MESSAGE =
  'Tool discussions are limited to devs with a verified work email';
const VERIFY_WORK_EMAIL_ROUTE = '/settings/profile/experience/work';

const VerifiedGateNotice = (): ReactElement => (
  <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-default p-3">
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {VERIFIED_GATE_MESSAGE}
    </Typography>
    <Link href={VERIFY_WORK_EMAIL_ROUTE} passHref>
      <Button
        tag="a"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        className="self-start"
      >
        Verify work email
      </Button>
    </Link>
  </div>
);

export const ToolDiscussion = ({
  toolId,
  toolTitle,
  discussionPostId,
}: ToolDiscussionProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { isVerified, isLoading: isCompaniesLoading } = useUserCompaniesQuery();
  const { displayToast } = useToastNotification();
  const commentRef = useRef<NewCommentRef>(null);
  // Set once the mutation below creates the post, so the composer can be
  // opened as soon as it finishes loading.
  const shouldOpenOnLoad = useRef(false);
  const [postId, setPostId] = useState<string | null>(discussionPostId);

  // The SSG prop can still deliver the id after the client already resolved
  // one from `initToolDiscussion` (ISR revalidation); never downgrade it.
  useEffect(() => {
    setPostId((current) => current ?? discussionPostId);
  }, [discussionPostId]);

  const { post, isLoading } = usePostById({ id: postId ?? '' });

  useEffect(() => {
    if (shouldOpenOnLoad.current && post) {
      shouldOpenOnLoad.current = false;
      commentRef.current?.onShowInput(Origin.ToolPage);
    }
  }, [post]);

  const { mutate: startDiscussion, isPending: isStarting } = useMutation({
    mutationFn: () => initToolDiscussion(toolId),
    onSuccess: (id) => {
      shouldOpenOnLoad.current = true;
      setPostId(id);
    },
    onError: (error: unknown) => {
      const message = (error as GraphQLError)?.response?.errors?.[0]?.message;
      displayToast(message ?? 'Failed to start the discussion');
    },
  });

  // Logged in but no verified work email: the server rejects the mutation
  // anyway, so the composer is replaced before the user ever gets there.
  // While the companies query is still resolving, treat replies as blocked
  // too rather than briefly allowing a composer that then gets pulled away.
  const isCheckingVerification = !!user && isCompaniesLoading;
  const isGated = !!user && !isCompaniesLoading && !isVerified;
  const canReply = !user || (!isCompaniesLoading && isVerified);

  const handleReplyBlocked = useCallback(() => {
    displayToast(VERIFIED_GATE_MESSAGE);
  }, [displayToast]);

  const handleStart = (): void => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.Comment });
      return;
    }

    if (postId) {
      commentRef.current?.onShowInput(Origin.ToolPage);
      return;
    }

    startDiscussion();
  };

  if (postId && (isLoading || !post)) {
    return <PlaceholderCommentList placeholderAmount={1} />;
  }

  if (postId && post) {
    const renderComposer = (): ReactElement => {
      if (isCheckingVerification) {
        return <PlaceholderCommentList placeholderAmount={1} />;
      }

      if (isGated) {
        return <VerifiedGateNotice />;
      }

      return (
        <NewComment
          post={post}
          ref={commentRef}
          CommentInputOrModal={CommentInputOrModal}
        />
      );
    };

    return (
      <div className="flex flex-col gap-4">
        {renderComposer()}
        <PostComments
          post={post}
          origin={Origin.ToolPage}
          canReply={canReply}
          onReplyBlocked={handleReplyBlocked}
        />
      </div>
    );
  }

  if (isCheckingVerification) {
    return <PlaceholderCommentList placeholderAmount={1} />;
  }

  if (isGated) {
    return <VerifiedGateNotice />;
  }

  return (
    <button
      type="button"
      disabled={isStarting}
      onClick={handleStart}
      className="disabled:opacity-70 rounded-12 border border-border-subtlest-tertiary bg-background-default p-3 text-left text-text-quaternary typo-callout"
    >
      Share your experience with {toolTitle}…
    </button>
  );
};
