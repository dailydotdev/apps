import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
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
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { ReputationUserBadge } from '@dailydotdev/shared/src/components/ReputationUserBadge';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
import { FlagIcon } from '@dailydotdev/shared/src/components/icons/Flag';
import { ShieldWarningIcon } from '@dailydotdev/shared/src/components/icons/ShieldWarning';
import { LfgIcon } from '../icons';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { SendAirplaneIcon } from '@dailydotdev/shared/src/components/icons/SendAirplane';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TypingIndicator } from '@dailydotdev/shared/src/features/messages/components/TypingIndicator';
import { ConversationIntro } from '@dailydotdev/shared/src/features/messages/components/ConversationIntro';
import { composerFrame } from '@dailydotdev/shared/src/features/interests/components/AgentComposer';
import { DirectMessageAccess } from '@dailydotdev/shared/src/features/messages/graphql';
import type { LfgUser, ReachOut } from '../data';
import { AskType, me, spamReasons, users } from '../data';
import type { Chat } from '../store';
import { findPost, isLooking, useProto } from '../store';
import {
  getReceipts,
  LfgAvatar,
  LfgContextCard,
  ReceiptList,
  relativeDays,
  SectionLabel,
} from '../ui';
import { LinkVerification } from './ReachOut';

const spamReason = spamReasons;

const firstName = (user: LfgUser): string => user.name.split(' ')[0];

const ViaLfg = (): ReactElement => (
  <span className="flex items-center gap-1 text-text-quaternary typo-caption1">
    <LfgIcon size={IconSize.Size16} />
    Looking for group
  </span>
);

/* ------------------------------------------------------------- the list */

const RequestRow = ({
  request,
  active,
}: {
  request: ReachOut;
  active: boolean;
}): ReactElement => {
  const { state, navigate } = useProto();
  const from = users[request.fromId];
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={() =>
        navigate({ name: 'messages', tab: 'requests', peerId: request.id })
      }
      className={classNames(
        'flex w-full items-center gap-3 rounded-12 px-3 py-2.5 text-left transition-colors hover:bg-surface-hover',
        active && 'bg-surface-float',
      )}
    >
      <LfgAvatar
        user={from}
        size={ProfileImageSize.Large}
        looking={isLooking(state, from.id)}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1">
          <Typography type={TypographyType.Callout} bold truncate>
            {from.name}
          </Typography>
          <ReputationUserBadge user={from} disableTooltip />
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="ml-auto shrink-0"
          >
            {relativeDays(request.createdAt)}
          </Typography>
        </span>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          truncate
        >
          {request.pitch}
        </Typography>
      </span>
    </button>
  );
};

const RequestList = ({ activeId }: { activeId?: string }): ReactElement => {
  const { state } = useProto();
  const [showFiltered, setShowFiltered] = useState(false);
  const pending = state.reachOuts.filter(
    (item) => item.toId === me.id && item.status === 'pending',
  );
  const clean = pending.filter((item) => !spamReason[item.fromId]);
  const filtered = pending.filter((item) => spamReason[item.fromId]);
  const postIds = [...new Set(clean.map((item) => item.postId))];

  if (!pending.length) {
    return (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="px-6 py-10 text-center"
      >
        No requests right now.
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      {postIds.map((postId) => {
        const post = findPost(state, postId);
        return (
          <div key={postId} className="flex flex-col gap-1">
            {post && (
              <LfgContextCard
                post={post}
                label={`Responses to your post · ${
                  clean.filter((item) => item.postId === postId).length
                }`}
                className="mb-1"
              />
            )}
            {clean
              .filter((item) => item.postId === postId)
              .map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  active={request.id === activeId}
                />
              ))}
          </div>
        );
      })}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-border-subtlest-tertiary pt-3">
          <button
            type="button"
            onClick={() => setShowFiltered((value) => !value)}
            className="flex items-center justify-between rounded-12 px-3 py-2 text-left hover:bg-surface-hover"
          >
            <span className="flex flex-col">
              <Typography type={TypographyType.Footnote} bold>
                Filtered ({filtered.length})
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Requests that look like spam. They don&apos;t notify you.
              </Typography>
            </span>
            <ArrowIcon
              className={showFiltered ? 'rotate-0' : 'rotate-180'}
              size={IconSize.Size16}
            />
          </button>
          {showFiltered &&
            filtered.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                active={request.id === activeId}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const ChatRow = ({
  chat,
  active,
}: {
  chat: Chat;
  active: boolean;
}): ReactElement => {
  const { state, navigate } = useProto();
  const peer = users[chat.peerId];
  const last = chat.messages[chat.messages.length - 1];
  const isUnread = !!chat.unread && !active;
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={() =>
        navigate({ name: 'messages', tab: 'chats', peerId: chat.peerId })
      }
      className={classNames(
        'flex w-full items-center gap-3 rounded-12 px-3 py-2.5 text-left transition-colors hover:bg-surface-hover',
        active && 'bg-surface-float',
      )}
    >
      <LfgAvatar
        user={peer}
        size={ProfileImageSize.Large}
        looking={isLooking(state, peer.id)}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-baseline gap-2">
          <Typography
            type={TypographyType.Callout}
            bold={isUnread}
            truncate
            className="flex-1"
          >
            {peer.name}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="shrink-0"
          >
            {relativeDays(last.at)}
          </Typography>
        </span>
        <span className="flex items-center gap-2">
          <Typography
            type={TypographyType.Footnote}
            color={
              isUnread ? TypographyColor.Primary : TypographyColor.Tertiary
            }
            truncate
            className="flex-1"
          >
            {last.fromId === me.id && 'You: '}
            {last.body}
          </Typography>
          {isUnread && (
            <span className="size-2 shrink-0 rounded-full bg-accent-cabbage-default" />
          )}
        </span>
        {chat.postId && <ViaLfg />}
      </span>
    </button>
  );
};

/* ---------------------------------------------------------- the panes */

const PaneHeader = ({
  user,
  onBack,
  actions,
}: {
  user: LfgUser;
  onBack: () => void;
  actions?: ReactNode;
}): ReactElement => {
  const { state } = useProto();
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-2 tablet:px-4">
      <Button
        type="button"
        aria-label="Back"
        className="laptop:hidden"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<ArrowIcon className="-rotate-90" />}
        onClick={onBack}
      />
      <LfgAvatar
        user={user}
        size={ProfileImageSize.Medium}
        looking={isLooking(state, user.id)}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1">
          <Typography type={TypographyType.Callout} bold truncate>
            {user.name}
          </Typography>
          <ReputationUserBadge user={user} disableTooltip />
        </span>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          truncate
        >
          @{user.username} · {user.timezone}
        </Typography>
      </span>
      {actions}
    </header>
  );
};

const RequestDetail = ({ request }: { request: ReachOut }): ReactElement => {
  const { state, navigate, answerRequest, reportUser } = useProto();
  const from = users[request.fromId];
  const post = findPost(state, request.postId);
  const receipts = getReceipts(from);
  const flag = spamReason[from.id];

  return (
    <>
      <PaneHeader
        user={from}
        onBack={() => navigate({ name: 'messages', tab: 'requests' })}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-5 px-4 py-6 tablet:px-6">
          {post && (
            <LfgContextCard
              post={post}
              label="Responding to your post"
              onOpen={() => navigate({ name: 'post', id: post.id })}
            />
          )}
          {flag && (
            <div className="flex items-start gap-2 rounded-12 border border-status-warning px-3 py-2">
              <ShieldWarningIcon
                size={IconSize.Size16}
                className="mt-0.5 shrink-0 text-status-warning"
              />
              <Typography
                type={TypographyType.Footnote}
                className="min-w-0 flex-1"
              >
                {flag}
              </Typography>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <SectionLabel>Pitch</SectionLabel>
            <p className="w-fit max-w-full whitespace-pre-wrap break-words rounded-16 rounded-bl-4 border border-border-subtlest-tertiary px-3 py-2 text-text-primary typo-callout">
              {request.pitch}
            </p>
          </div>
          {post && (
            <div className="flex flex-col gap-3">
              <SectionLabel>What you asked for</SectionLabel>
              {post.asks.map((ask) => {
                const value = request.answers[ask.id] ?? '';
                return (
                  <div key={ask.id} className="flex flex-col gap-0.5">
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      {ask.label}
                    </Typography>
                    {ask.type === AskType.Link ? (
                      <>
                        <Typography
                          type={TypographyType.Callout}
                          color={TypographyColor.Link}
                          className="break-all"
                        >
                          {value}
                        </Typography>
                        <LinkVerification url={value} user={from} />
                      </>
                    ) : (
                      <Typography type={TypographyType.Callout}>
                        {value}
                      </Typography>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <SectionLabel>About {from.name}</SectionLabel>
            <ReceiptList items={receipts} />
          </div>
        </div>
      </div>
      <div className="mx-4 mb-4 flex shrink-0 flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary px-4 py-4 text-center tablet:mx-6">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          @{from.username} wants to message you about your post. They won&apos;t
          know you saw this unless you accept.
        </Typography>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<FlagIcon />}
            onClick={() => reportUser(from.id)}
          >
            Report
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={() => answerRequest(request.id, false)}
          >
            Decline
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={() => answerRequest(request.id, true)}
          >
            Accept
          </Button>
        </div>
      </div>
    </>
  );
};

const codeLinkPattern = /(https?:\/\/(?:github\.com|gitlab\.com)\/\S+)/g;

const LinkWarning = ({
  url,
  peer,
  onClose,
}: {
  url: string;
  peer: LfgUser;
  onClose: () => void;
}): ReactElement => {
  const { reportUser } = useProto();
  return (
    <Modal
      isOpen
      isDrawerOnMobile
      size={ModalSize.Small}
      onRequestClose={onClose}
    >
      <Modal.Header title="Before you open this" />
      <Modal.Body className="flex flex-col gap-3">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          You met {peer.name} today. Fake job and co-founder offers often ask
          people to clone a repo and run it, which can install malware that
          steals passwords, keys and wallets.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Read the code before you run anything, and never run a stranger&apos;s
          install scripts on your own machine.
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="break-all"
        >
          {url}
        </Typography>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          icon={<FlagIcon />}
          onClick={() => {
            onClose();
            reportUser(peer.id);
          }}
        >
          Report {firstName(peer)}
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          onClick={onClose}
        >
          Open anyway
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const MessageBody = ({
  body,
  onLink,
}: {
  body: string;
  onLink: (url: string) => void;
}): ReactElement => (
  <>
    {body.split(codeLinkPattern).map((part, index) =>
      /^https?:\/\//.test(part) ? (
        <button
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          type="button"
          className="break-all text-text-link underline"
          onClick={() => onLink(part)}
        >
          {part}
        </button>
      ) : (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={index}>{part}</React.Fragment>
      ),
    )}
  </>
);

const ChatThread = ({ chat }: { chat: Chat }): ReactElement => {
  const { state, navigate, sendMessage, track } = useProto();
  const peer = users[chat.peerId];
  const post = findPost(state, chat.postId);
  const [value, setValue] = useState('');
  const [showSafety, setShowSafety] = useState(true);
  const [warnUrl, setWarnUrl] = useState<string>();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [chat.messages.length, chat.typing]);

  const send = () => {
    const body = value.trim();
    if (!body) {
      return;
    }
    sendMessage(peer.id, body);
    setValue('');
  };

  return (
    <>
      <PaneHeader
        user={peer}
        onBack={() => navigate({ name: 'messages', tab: 'chats' })}
        actions={
          post && (
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() => navigate({ name: 'post', id: post.id })}
            >
              View post
            </Button>
          )
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-1.5 px-4 py-6 tablet:px-6">
          <ConversationIntro
            peer={{ ...peer, access: DirectMessageAccess.Open }}
          />
          {post && (
            <LfgContextCard
              post={post}
              label={
                post.authorId === me.id
                  ? 'You met through your post'
                  : `You met through ${firstName(peer)}'s post`
              }
              onOpen={() => navigate({ name: 'post', id: post.id })}
              className="mb-2"
            />
          )}
          {showSafety && (
            <div className="mb-3 flex items-start gap-2 rounded-12 bg-surface-float px-3 py-2">
              <ShieldWarningIcon
                size={IconSize.Size16}
                className="mt-0.5 shrink-0 text-text-tertiary"
              />
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Secondary}
                className="flex-1"
              >
                Never run code or install packages from someone you just met,
                and never pay to join a project. Report anything that feels off.
              </Typography>
              <CloseButton
                size={ButtonSize.XSmall}
                onClick={() => setShowSafety(false)}
              />
            </div>
          )}
          {chat.messages.map((message) => {
            const isMine = message.fromId === me.id;
            return (
              <div
                key={message.id}
                className={classNames(
                  'flex max-w-[85%] tablet:max-w-[30rem]',
                  isMine ? 'self-end' : 'self-start',
                )}
              >
                <p
                  className={classNames(
                    'max-w-full whitespace-pre-wrap break-words rounded-16 px-3 py-2 text-text-primary typo-callout',
                    isMine
                      ? 'rounded-br-4 bg-surface-float'
                      : 'rounded-bl-4 border border-border-subtlest-tertiary',
                  )}
                >
                  <MessageBody
                    body={message.body}
                    onLink={(url) => {
                      track('link-warning');
                      setWarnUrl(url);
                    }}
                  />
                </p>
              </div>
            );
          })}
          {chat.typing && <TypingIndicator username={peer.username} />}
          <div ref={endRef} />
        </div>
      </div>
      <div className="shrink-0 px-4 pb-4 tablet:px-6">
        <div className="mx-auto w-full max-w-[45rem]">
          <div className={classNames(composerFrame, 'flex flex-row items-end')}>
            <textarea
              rows={1}
              aria-label={`Message @${peer.username}`}
              placeholder={`Message ${firstName(peer)}`}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              className="block min-w-0 flex-1 resize-none bg-transparent py-1.5 text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
            />
            <Button
              type="button"
              aria-label="Send"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={<SendAirplaneIcon />}
              disabled={!value.trim()}
              onClick={send}
            />
          </div>
        </div>
      </div>
      {warnUrl && (
        <LinkWarning
          url={warnUrl}
          peer={peer}
          onClose={() => setWarnUrl(undefined)}
        />
      )}
    </>
  );
};

/* -------------------------------------------------------------- screen */

export const MessagesScreen = ({
  tab,
  peerId,
}: {
  tab: 'chats' | 'requests';
  peerId?: string;
}): ReactElement => {
  const { state, navigate } = useProto();
  const requestCount = state.reachOuts.filter(
    (item) =>
      item.toId === me.id &&
      item.status === 'pending' &&
      !spamReason[item.fromId],
  ).length;
  const request =
    tab === 'requests'
      ? state.reachOuts.find(
          (item) => item.id === peerId && item.status === 'pending',
        )
      : undefined;
  const chat =
    tab === 'chats'
      ? state.chats.find((item) => item.peerId === peerId)
      : undefined;
  const hasDetail = !!request || !!chat;

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1">
      <div
        className={classNames(
          'w-full min-w-0 shrink-0 flex-col laptop:flex laptop:w-80 laptop:border-r laptop:border-border-subtlest-tertiary',
          hasDetail ? 'hidden' : 'flex',
        )}
      >
        <header className="flex h-14 shrink-0 items-center px-4">
          <Typography tag={TypographyTag.H1} type={TypographyType.Title3} bold>
            Messages
          </Typography>
        </header>
        <nav aria-label="Inbox" className="flex shrink-0 gap-1 px-4 pb-2">
          <Button
            type="button"
            variant={
              tab === 'chats' ? ButtonVariant.Float : ButtonVariant.Tertiary
            }
            size={ButtonSize.Small}
            aria-current={tab === 'chats' ? 'page' : undefined}
            onClick={() => navigate({ name: 'messages', tab: 'chats' })}
          >
            Chats
          </Button>
          <Button
            type="button"
            variant={
              tab === 'requests' ? ButtonVariant.Float : ButtonVariant.Tertiary
            }
            size={ButtonSize.Small}
            aria-current={tab === 'requests' ? 'page' : undefined}
            onClick={() => navigate({ name: 'messages', tab: 'requests' })}
          >
            Requests{requestCount > 0 && ` (${requestCount})`}
          </Button>
        </nav>
        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          {tab === 'requests' ? (
            <RequestList activeId={peerId} />
          ) : (
            <div className="flex flex-col px-2">
              {state.chats.length === 0 && (
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                  className="px-6 py-10 text-center"
                >
                  No chats yet.
                </Typography>
              )}
              {state.chats.map((item) => (
                <ChatRow
                  key={item.peerId}
                  chat={item}
                  active={item.peerId === peerId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        className={classNames(
          'min-w-0 flex-1 flex-col',
          hasDetail ? 'flex' : 'hidden laptop:flex',
        )}
      >
        {request && <RequestDetail key={request.id} request={request} />}
        {chat && <ChatThread key={chat.peerId} chat={chat} />}
        {!hasDetail && (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Pick a conversation to start chatting.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
