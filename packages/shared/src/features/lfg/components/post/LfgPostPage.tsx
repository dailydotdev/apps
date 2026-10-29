import type { ReactElement, ReactNode } from 'react';
import React, { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from '../../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Separator } from '../../../../components/cards/common/common';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { ShellPrimaryPill } from '../../../../components/shell/ShellSquare';
import { usePassedBlock } from '../../../../components/shell/usePassedBlock';
import { IconSize } from '../../../../components/Icon';
import { FlagIcon } from '../../../../components/icons/Flag';
import { LinkIcon } from '../../../../components/icons/Link';
import { SquadSubPageHeader } from '../../../squads/components/SquadSubPageHeader';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { reportUserReasons } from '../../../../components/modals/report/ReportUserModal';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import useLogEventOnce from '../../../../hooks/log/useLogEventOnce';
import { LogEvent, Origin, TargetType } from '../../../../lib/log';
import type { LfgPost } from '../../types';
import { LfgAskType } from '../../types';
import { lfgCommitmentLabel } from '../../constants';
import { invalidateLfgBoardQueries, lfgPostQueryOptions } from '../../queries';
import { reportLfgPost } from '../../graphql';
import { getFirstName, getLfgUrl, lfgRelativeDays } from '../../lib/format';
import { canReachOutToLfgPost } from '../../lib/status';
import { useLfgModals } from '../../hooks/useLfgModals';
import { LfgFrame, lfgPanelClassName } from '../LfgFrame';
import { LfgKindLine } from '../LfgKind';
import { LfgTagList } from '../LfgTags';
import { getLfgPlace } from '../LfgRow';
import { LfgOwnerWidget } from './LfgOwnerWidget';
import {
  LfgAuthorWidget,
  LfgCreditsLine,
  LfgReachOutButton,
  LfgReachOutState,
} from './LfgAuthorWidget';

const Block = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-2">
    <Typography tag={TypographyTag.H2} type={TypographyType.Callout} bold>
      {label}
    </Typography>
    {children}
  </section>
);

const PostSkeleton = (): ReactElement => (
  <LfgFrame>
    <div className={lfgPanelClassName()}>
      <div className="h-5 w-24 animate-pulse rounded-8 bg-surface-float" />
      <div className="h-8 w-3/4 animate-pulse rounded-8 bg-surface-float" />
      <div className="h-32 animate-pulse rounded-12 bg-surface-float" />
    </div>
  </LfgFrame>
);

const PostGone = (): ReactElement => (
  <LfgFrame>
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <Typography type={TypographyType.Body} bold>
        This post isn&apos;t here anymore
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-80"
      >
        Its author may have deleted it. There are more people looking on the
        board.
      </Typography>
      <Link href={getLfgUrl()} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
        >
          Go to the board
        </Button>
      </Link>
    </div>
  </LfgFrame>
);

// The reasons reportLfgPost takes, worded as when reporting a user. The API
// has no reason for paid work, which the house rules ban, so spam covers it.
const postReportReasons = reportUserReasons
  .filter(({ value }) =>
    [
      'SPAM',
      'HARASSMENT',
      'HATEFUL',
      'INAPPROPRIATE',
      'IMPERSONATION',
      'OTHER',
    ].includes(value),
  )
  .map((reason) =>
    reason.value === 'SPAM'
      ? { ...reason, label: 'Spam, selling or paid work' }
      : reason,
  );

const PostBody = ({ post }: { post: LfgPost }): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { openModal, closeModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const { openReachOut } = useLfgModals();
  const ctaRef = useRef<HTMLDivElement>(null);
  const { author } = post;
  const isMine = author.id === user?.id;
  const first = getFirstName(author.name);
  const canReachOut = canReachOutToLfgPost(post, user?.id);
  // Once the in-page button scrolls away, Reach out joins the top block,
  // like Join does on a squad page.
  const hasCtaPassed = usePassedBlock(ctaRef, canReachOut);
  const title = isMine ? 'Your post' : `${first}'s post`;
  const place = getLfgPlace(post);
  const reachOut = () => openReachOut(post, Origin.LfgPost);

  useLogEventOnce(() => ({
    event_name: LogEvent.OpenLfgPost,
    target_type: TargetType.LfgPost,
    target_id: post.id,
    extra: JSON.stringify({
      kind: post.kind,
      status: post.status,
      is_author: isMine,
    }),
  }));

  const reportPost = useMutation({
    mutationFn: ({ reason, comment }: { reason: string; comment?: string }) =>
      reportLfgPost({ id: post.id, reason, comment }),
    onSuccess: (_, { reason }) => {
      logEvent({
        event_name: LogEvent.ReportLfgPost,
        target_type: TargetType.LfgPost,
        target_id: post.id,
        extra: JSON.stringify({ kind: post.kind, reason }),
      });
      invalidateLfgBoardQueries(queryClient, user);
      displayToast("Thanks for reporting. It's off your board while we look.");
    },
    onError: () => displayToast("Couldn't send the report. Please try again."),
    onSettled: () => closeModal(),
  });
  const report = () =>
    openModal({
      type: LazyModal.ReasonSelection,
      props: {
        isDrawerOnMobile: true,
        heading: 'Report post',
        reasons: postReportReasons,
        onReport: (event, reason, comment) => {
          event.preventDefault();
          reportPost.mutate({ reason, comment });
        },
      },
    });

  return (
    <LfgFrame
      side={
        isMine ? (
          <LfgOwnerWidget post={post} />
        ) : (
          <LfgAuthorWidget
            post={post}
            canReachOut={canReachOut}
            onReachOut={reachOut}
          />
        )
      }
    >
      <SquadSubPageHeader
        title={title}
        backUrl={getLfgUrl()}
        backLabel="Back to Looking for group"
        action={
          !isMine && (
            <Tooltip content="Report post">
              <Button
                type="button"
                aria-label="Report post"
                variant={ButtonVariant.Subtle}
                size={ButtonSize.Small}
                icon={<FlagIcon />}
                onClick={report}
              />
            </Tooltip>
          )
        }
        phoneActions={
          canReachOut &&
          hasCtaPassed && (
            <ShellPrimaryPill onClick={reachOut}>Reach out</ShellPrimaryPill>
          )
        }
      />
      <article className={lfgPanelClassName()}>
        <div className="flex flex-col gap-3">
          <LfgKindLine kind={post.kind} />
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.Title2}
            bold
            className="break-words"
          >
            {post.title}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="flex flex-wrap items-center tabular-nums"
          >
            {author.name}
            <Separator />
            {lfgRelativeDays(post.createdAt)}
            {place && (
              <>
                <Separator />
                {place}
              </>
            )}
            <Separator />
            {lfgCommitmentLabel[post.commitment]}
          </Typography>
        </div>
        {!isMine && (
          <div ref={ctaRef} className="flex flex-col gap-2 laptop:hidden">
            {canReachOut ? (
              <>
                <LfgReachOutButton className="w-full" onClick={reachOut} />
                <LfgCreditsLine />
              </>
            ) : (
              <LfgReachOutState post={post} />
            )}
          </div>
        )}
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="whitespace-pre-wrap break-words"
        >
          {post.body}
        </Typography>
        <div className="flex flex-col gap-6 border-t border-border-subtlest-tertiary pt-5">
          <Block label="Topics">
            <LfgTagList tags={post.tags} />
          </Block>
          <Block
            label={
              isMine
                ? 'You asked people to include'
                : `${first} asks you to include`
            }
          >
            {post.asks.length > 0 && (
              <ul className="flex flex-col gap-2">
                {post.asks.map((ask) => (
                  <li
                    key={ask.id}
                    className="flex items-center gap-2 break-words text-text-primary typo-callout"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-8 bg-surface-float text-text-tertiary">
                      {ask.type === LfgAskType.Link ? (
                        <LinkIcon size={IconSize.Size16} />
                      ) : (
                        <span className="typo-caption1">Aa</span>
                      )}
                    </span>
                    {ask.label}
                  </li>
                ))}
              </ul>
            )}
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {isMine
                ? `${
                    post.asks.length ? 'Plus' : 'Just'
                  } a short pitch, with details from their profile attached.`
                : `${
                    post.asks.length ? 'Plus' : 'Just'
                  } a short pitch. We attach details from your profile for you.`}
            </Typography>
          </Block>
        </div>
        {!isMine && (
          <Button
            type="button"
            className="self-start laptop:hidden"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<FlagIcon />}
            onClick={report}
          >
            Report post
          </Button>
        )}
      </article>
    </LfgFrame>
  );
};

export const LfgPostPage = ({ id }: { id: string }): ReactElement => {
  const { user } = useAuthContext();
  const {
    data: post,
    isPending,
    isError,
    refetch,
  } = useQuery(lfgPostQueryOptions(user, id));

  if (isPending) {
    return <PostSkeleton />;
  }

  // A failed request isn't a deleted post, and a failed refetch keeps the
  // post on screen.
  if (isError && !post) {
    return (
      <LfgFrame>
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Couldn&apos;t load this post.
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </div>
      </LfgFrame>
    );
  }

  if (!post) {
    return <PostGone />;
  }

  return <PostBody key={post.id} post={post} />;
};
