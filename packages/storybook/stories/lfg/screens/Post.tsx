import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import { ShellPrimaryPill } from '@dailydotdev/shared/src/components/shell/ShellSquare';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { FlagIcon } from '@dailydotdev/shared/src/components/icons/Flag';
import { SendAirplaneIcon } from '@dailydotdev/shared/src/components/icons/SendAirplane';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { VolunteeringIcon } from '@dailydotdev/shared/src/components/icons/Volunteering';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { LfgPost } from '../data';
import {
  AskType,
  commitmentLabel,
  DAILY_REACH_OUTS,
  me,
  PostStatus,
  users,
} from '../data';
import { findPost, myRequestTo, pendingFor, useProto } from '../store';
import {
  AuthorRow,
  canReachOut,
  daysLeft,
  getReceipts,
  isPaused,
  KindLine,
  ReceiptList,
  relativeDays,
  SectionLabel,
  matchesHelper,
  TagList,
} from '../ui';
import { PhoneHeader } from '../shell';
import { Frame, panelClassName, SubPageHeader } from '../frame';

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

const Note = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1 rounded-12 bg-surface-float px-3 py-2">
    <Typography type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {children}
    </Typography>
  </div>
);

const FoundModal = ({
  post,
  onClose,
}: {
  post: LfgPost;
  onClose: () => void;
}): ReactElement => {
  const { state, markFound } = useProto();
  const candidates = state.chats
    .filter((chat) => chat.postId === post.id)
    .map((chat) => users[chat.peerId]);
  const [choice, setChoice] = useState(candidates[0]?.id ?? 'outside');
  const waiting = pendingFor(state, post.id).length;

  return (
    <Modal
      isOpen
      isDrawerOnMobile
      size={ModalSize.Small}
      onRequestClose={onClose}
    >
      <Modal.Header title="Found someone?" />
      <Modal.Body className="flex flex-col gap-4">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Your post comes off the board.
          {waiting > 0 &&
            ` The ${waiting} ${
              waiting === 1 ? 'person' : 'people'
            } still waiting get a note that the spot is filled, so nobody is left hanging.`}
        </Typography>
        <div className="flex flex-col gap-2">
          <SectionLabel>Who did you team up with?</SectionLabel>
          <Radio
            name="found-with"
            value={choice}
            onChange={setChoice}
            options={[
              ...candidates.map((user) => ({
                label: user.name,
                value: user.id,
              })),
              { label: 'Someone I met elsewhere', value: 'outside' },
            ]}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          onClick={() => {
            markFound(post.id, choice === 'outside' ? undefined : choice);
            onClose();
          }}
        >
          Mark as found
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const OwnerWidget = ({ post }: { post: LfgPost }): ReactElement => {
  const { state, navigate, renewPost } = useProto();
  const [isFoundOpen, setFoundOpen] = useState(
    state.route.name === 'post' && !!state.route.openFound,
  );
  const waiting = pendingFor(state, post.id).length;
  const left = daysLeft(post.expiresAt);
  const accepted = state.chats.filter((chat) => chat.postId === post.id).length;

  if (state.phase === 'prelaunch') {
    return (
      <SquadWidget title="Your post is in">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mt-1"
        >
          It goes live when connections open. Until then, your avatar shows the
          LFG badge so people know you&apos;re looking.
        </Typography>
        <Button
          type="button"
          className="mt-3 w-full"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          onClick={() => navigate({ name: 'board' })}
        >
          Back to the board
        </Button>
      </SquadWidget>
    );
  }

  if (post.status === PostStatus.Found) {
    return (
      <SquadWidget title="You found someone">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mt-1"
        >
          The post is off the board. Everyone who was waiting got a note.
        </Typography>
        <Button
          type="button"
          className="mt-3 w-full"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          onClick={() => renewPost(post.id)}
        >
          Reopen post
        </Button>
      </SquadWidget>
    );
  }

  return (
    <SquadWidget title="Your post">
      <div className="mt-3 flex gap-6 border-b border-border-subtlest-tertiary pb-3">
        <span className="flex flex-col">
          <strong className="tabular-nums typo-callout">{waiting}</strong>
          <span className="text-text-tertiary typo-footnote">Waiting</span>
        </span>
        <span className="flex flex-col">
          <strong className="tabular-nums typo-callout">{accepted}</strong>
          <span className="text-text-tertiary typo-footnote">Accepted</span>
        </span>
        <span className="flex flex-col">
          <strong
            className={
              left <= 3
                ? 'tabular-nums text-status-error typo-callout'
                : 'tabular-nums typo-callout'
            }
          >
            {left}
          </strong>
          <span className="text-text-tertiary typo-footnote">Days left</span>
        </span>
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-3"
      >
        While it&apos;s up, your avatar shows the LFG badge.
      </Typography>
      <Button
        type="button"
        className="mt-3 w-full"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        disabled={waiting === 0}
        onClick={() => navigate({ name: 'messages', tab: 'requests' })}
      >
        Review responses
      </Button>
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          className="flex-1"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          onClick={() => setFoundOpen(true)}
        >
          Found someone
        </Button>
        <Button
          type="button"
          className="flex-1"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          onClick={() => renewPost(post.id)}
        >
          Renew
        </Button>
      </div>
      {isFoundOpen && (
        <FoundModal post={post} onClose={() => setFoundOpen(false)} />
      )}
    </SquadWidget>
  );
};

// What stands in for the Reach out button when there's nothing to press.
const ReachOutState = ({ post }: { post: LfgPost }): ReactElement | null => {
  const { state, navigate, showToast, track } = useProto();
  const author = users[post.authorId];
  const first = author.name.split(' ')[0];
  const request = myRequestTo(state, post.id);

  if (state.phase === 'prelaunch') {
    return (
      <div className="flex flex-col gap-2">
        <Note title="Connections open in a few days">
          You can reach out to {first} then.
        </Note>
        <Button
          type="button"
          className="w-full"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Medium}
          onClick={() => {
            track('remind');
            showToast("We'll let you know when it opens.");
          }}
        >
          Remind me
        </Button>
      </div>
    );
  }

  if (request?.status === 'accepted') {
    return (
      <Button
        type="button"
        className="w-full"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Medium}
        onClick={() =>
          navigate({ name: 'messages', tab: 'chats', peerId: author.id })
        }
      >
        Open chat
      </Button>
    );
  }
  if (request) {
    return (
      <Note
        title={
          request.status === 'filled'
            ? 'This spot was filled'
            : `Request sent ${relativeDays(request.createdAt)}`
        }
      >
        {request.status === 'filled'
          ? `${first} found someone. Thanks for reaching out.`
          : `You'll get a notification if ${first} accepts. If not, you won't hear anything.`}
      </Note>
    );
  }
  if (isPaused(state, post)) {
    return (
      <Note title="Paused for now">
        {first} has a lot of responses to go through. The post reopens as they
        answer them.
      </Note>
    );
  }
  return null;
};

const ReachOutButton = ({
  post,
  className,
}: {
  post: LfgPost;
  className?: string;
}): ReactElement => {
  const { openComposer, reachOutsLeft } = useProto();
  return (
    <Button
      type="button"
      className={className}
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      icon={<SendAirplaneIcon />}
      disabled={reachOutsLeft === 0}
      onClick={() => openComposer(post.id)}
    >
      Reach out
    </Button>
  );
};

const CreditsLine = (): ReactElement => {
  const { reachOutsLeft } = useProto();
  return (
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="text-center tabular-nums"
    >
      {reachOutsLeft} of {DAILY_REACH_OUTS} reach-outs left today. Accepted ones
      come back.
    </Typography>
  );
};

const AuthorWidget = ({ post }: { post: LfgPost }): ReactElement => {
  const { state } = useProto();
  const author = users[post.authorId];
  const helper = state.helpers[me.id];
  const matchesHelp = !!helper && matchesHelper(helper, post, author);

  return (
    <SquadWidget title={`About ${author.name.split(' ')[0]}`}>
      <AuthorRow user={author} meta={`@${author.username}`} className="mt-3" />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
        className="mt-3"
      >
        {author.bio}
      </Typography>
      <ReceiptList items={getReceipts(author)} className="mt-3" />
      {matchesHelp && (
        <div className="mt-3 flex items-center gap-2 rounded-12 bg-action-upvote-float px-3 py-2 text-accent-avocado-default typo-footnote">
          <VolunteeringIcon size={IconSize.Size16} secondary />
          <span className="min-w-0 flex-1">
            Matches what you&apos;re open to helping with
          </span>
        </div>
      )}
      {canReachOut(state, post) ? (
        <div className="mt-4 hidden flex-col gap-2 laptop:flex">
          <ReachOutButton post={post} className="w-full" />
          <CreditsLine />
        </div>
      ) : (
        <div className="mt-4 hidden laptop:block">
          <ReachOutState post={post} />
        </div>
      )}
    </SquadWidget>
  );
};

export const PostScreen = ({ id }: { id: string }): ReactElement | null => {
  const { state, back, showToast, track, openComposer } = useProto();
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaPassed, setCtaPassed] = useState(false);
  const post = findPost(state, id);

  // Once the in-page button scrolls away, Reach out joins the top block,
  // like Join does on a squad page.
  useEffect(() => {
    const node = ctaRef.current;
    if (!node) {
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) =>
      setCtaPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [post?.id]);

  if (!post) {
    return null;
  }
  const author = users[post.authorId];
  const isMine = post.authorId === me.id;
  const first = author.name.split(' ')[0];
  const reachable = canReachOut(state, post);
  const title = isMine ? 'Your post' : `${first}'s post`;
  const report = () => {
    track('report-post');
    showToast("Thanks. We'll review this post.");
  };

  return (
    <>
      <PhoneHeader
        title={title}
        onBack={back}
        actions={
          reachable &&
          ctaPassed && (
            <ShellPrimaryPill onClick={() => openComposer(post.id)}>
              Reach out
            </ShellPrimaryPill>
          )
        }
      />
      <Frame
        side={
          isMine ? <OwnerWidget post={post} /> : <AuthorWidget post={post} />
        }
      >
        <SubPageHeader
          title={title}
          onBack={back}
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
        />
        <article className={panelClassName()}>
          <div className="flex flex-col gap-3">
            <KindLine post={post} />
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title2}
              bold
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
              {relativeDays(post.createdAt)}
              <Separator />
              {author.timezone}
              {post.showCountry && ` · ${author.country}`}
              <Separator />
              {commitmentLabel[post.commitment]}
            </Typography>
          </div>
          {!isMine && (
            <div ref={ctaRef} className="flex flex-col gap-2 laptop:hidden">
              {reachable ? (
                <>
                  <ReachOutButton post={post} className="w-full" />
                  <CreditsLine />
                </>
              ) : (
                <ReachOutState post={post} />
              )}
            </div>
          )}
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
          >
            {post.body}
          </Typography>
          <div className="flex flex-col gap-6 border-t border-border-subtlest-tertiary pt-5">
            <Block label="Topics">
              <TagList tags={post.tags} />
            </Block>
            <Block
              label={
                isMine
                  ? 'You asked people to include'
                  : `${first} asks you to include`
              }
            >
              <ul className="flex flex-col gap-2">
                {post.asks.map((ask) => (
                  <li
                    key={ask.id}
                    className="flex items-center gap-2 text-text-primary typo-callout"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-8 bg-surface-float text-text-tertiary">
                      {ask.type === AskType.Link ? (
                        <LinkIcon size={IconSize.Size16} />
                      ) : (
                        <span className="typo-caption1">Aa</span>
                      )}
                    </span>
                    {ask.label}
                  </li>
                ))}
              </ul>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {isMine
                  ? 'Plus a short pitch, with details from their profile attached.'
                  : 'Plus a short pitch. We attach details from your profile for you.'}
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
      </Frame>
    </>
  );
};
