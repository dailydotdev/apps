import type { ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { AgentUpdate } from './data';
import { agentUpdates, toneClass } from './data';

export type AgentChatVariant = 'group' | 'assistant' | 'terminal';

const shortAgo = (iso: string): string => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return minutes < 60 ? `${minutes}m` : `${Math.round(minutes / 60)}h`;
};

/**
 * Four lines, then "Show more", which goes to the update itself rather than
 * growing the bubble: the column has a fixed height and a long message would
 * push every other one out of view.
 */
const ClampedMessage = ({
  children,
  className,
  moreClassName,
}: {
  children: ReactNode;
  className?: string;
  moreClassName?: string;
}): ReactElement => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element) {
      setIsClamped(element.scrollHeight > element.clientHeight + 1);
    }
  }, [children]);

  return (
    <>
      <p
        ref={ref}
        className={classNames('line-clamp-4 break-words', className)}
      >
        {children}
      </p>
      {isClamped && (
        <a
          href="#"
          onClick={(event) => event.preventDefault()}
          className={classNames(
            'mt-1 self-start font-bold hover:underline typo-caption1',
            moreClassName ?? 'text-text-link',
          )}
        >
          Show more
        </a>
      )}
    </>
  );
};

const AgentAvatar = ({
  update,
  className,
}: {
  update: AgentUpdate;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center rounded-10 font-bold text-text-primary typo-caption2',
      toneClass[update.tone].subtle,
      className,
    )}
  >
    {update.image ? (
      <img
        src={update.image}
        alt=""
        className="h-full w-full rounded-[inherit] object-cover"
      />
    ) : (
      update.initial
    )}
  </span>
);

const MessageBody = ({ update }: { update: AgentUpdate }): ReactElement => (
  <>
    {update.headline && (
      <span className="font-bold text-text-primary">{update.headline} </span>
    )}
    {update.change}
  </>
);

/** Each agent posts as itself, like a team channel. */
const GroupMessage = ({ update }: { update: AgentUpdate }): ReactElement => (
  <div className="flex gap-2">
    <AgentAvatar update={update} className="size-7" />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex items-baseline gap-1.5 typo-caption1">
        <span className="font-bold text-text-primary">{update.agent}</span>
        {update.version && (
          <span className="font-mono text-text-tertiary">
            v{update.version}
          </span>
        )}
        <span className="ml-auto tabular-nums text-text-quaternary">
          {shortAgo(update.at)}
        </span>
      </span>
      <div className="flex flex-col rounded-16 rounded-tl-4 bg-surface-float px-3 py-2">
        <ClampedMessage className="text-text-secondary typo-footnote">
          <MessageBody update={update} />
        </ClampedMessage>
      </div>
    </div>
  </div>
);

/** One assistant voice, an update per message. */
const AssistantMessage = ({
  update,
}: {
  update: AgentUpdate;
}): ReactElement => (
  <div className="flex flex-col rounded-16 rounded-tl-4 bg-surface-float px-3 py-2">
    <span className="mb-0.5 flex items-center gap-1.5 typo-caption1">
      <AgentAvatar
        update={update}
        className="size-4 !rounded-4 !typo-caption2"
      />
      <span className="font-bold text-text-primary">
        {update.agent}
        {update.version && ` ${update.version}`}
      </span>
      <span className="ml-auto tabular-nums text-text-quaternary">
        {shortAgo(update.at)}
      </span>
    </span>
    <ClampedMessage className="text-text-secondary typo-footnote">
      <MessageBody update={update} />
    </ClampedMessage>
  </div>
);

/** A Claude Code transcript, one result per agent. */
const TerminalMessage = ({ update }: { update: AgentUpdate }): ReactElement => (
  <div className="flex gap-2 font-mono typo-caption1">
    <span className={classNames('mt-0.5', toneClass[update.tone].text)}>⏺</span>
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="text-text-primary">
        <span className="font-bold">{update.agent}</span>
        {update.version && (
          <span className="text-text-tertiary"> v{update.version}</span>
        )}
        <span className="text-text-quaternary"> · {shortAgo(update.at)}</span>
      </span>
      <ClampedMessage
        className="text-text-tertiary"
        moreClassName={toneClass[update.tone].text}
      >
        <MessageBody update={update} />
      </ClampedMessage>
    </div>
  </div>
);

export const AgentChatColumn = ({
  variant,
  updates = agentUpdates,
  native = false,
  className,
}: {
  variant: AgentChatVariant;
  updates?: AgentUpdate[];
  /** Production's column grammar: no box, Happening Now's heading, and a
   * "View all" footer on the carousel's paging row. */
  native?: boolean;
  className?: string;
}): ReactElement => {
  // Oldest first, so the newest lands at the bottom, the way a chat reads.
  const thread = [...updates].reverse();

  return (
    <aside
      className={classNames(
        'flex min-h-0 min-w-0 flex-col overflow-hidden',
        !native &&
          'hero-card rounded-16 border border-border-subtlest-tertiary',
        !native && variant === 'terminal' && 'bg-background-subtle',
        className,
      )}
    >
      <header
        className={classNames(
          'flex items-center gap-2 px-4',
          native ? 'pb-2' : 'pb-1 pt-3',
        )}
      >
        <h3
          className={classNames(
            'font-bold text-text-primary',
            native ? 'typo-title3' : 'typo-callout',
          )}
        >
          Agent updates
        </h3>
        <span className="flex items-center gap-1 rounded-6 bg-accent-avocado-flat px-1.5 py-0.5 font-bold text-accent-avocado-default typo-caption2">
          <span className="size-1.5 rounded-max bg-accent-avocado-default" />
          LIVE
        </span>
      </header>
      {/* `flex-col-reverse` pins the thread to the bottom, so the column opens
          on the newest message without a scroll effect. */}
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col-reverse overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_1.5rem)]">
        <div
          className={classNames(
            'flex flex-col px-4 pb-4 pt-2',
            variant === 'terminal' ? 'gap-3' : 'gap-4',
          )}
        >
          {thread.map((update) => {
            if (variant === 'assistant') {
              return <AssistantMessage key={update.id} update={update} />;
            }
            if (variant === 'terminal') {
              return <TerminalMessage key={update.id} update={update} />;
            }
            return <GroupMessage key={update.id} update={update} />;
          })}
        </div>
      </div>
      {native && (
        <a
          href="#"
          onClick={(event) => event.preventDefault()}
          className="mx-4 mb-3 mt-2 flex h-6 items-center font-bold text-text-primary typo-footnote hover:underline"
        >
          View all agent updates
          <span aria-hidden className="ml-auto leading-none typo-body">
            →
          </span>
        </a>
      )}
    </aside>
  );
};
