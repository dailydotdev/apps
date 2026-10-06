import type { ReactElement } from 'react';
import React, { useId, useState } from 'react';
import classNames from 'classnames';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons/Magic';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';

const AgentFeedMockCard = ({
  children,
  agentName,
}: {
  children: ReactElement;
  agentName: string;
}): ReactElement => {
  const { shouldUseListFeedLayout, shouldUseListMode } = useFeedLayout();
  const isList = shouldUseListFeedLayout || shouldUseListMode;
  const [showReason, setShowReason] = useState(false);
  const reasonId = useId();

  return (
    <div
      className={classNames(
        'relative rounded-16 ring-1 ring-brand-default',
        !isList && 'h-full min-h-card',
      )}
    >
      <div className={classNames(!isList && 'absolute inset-0 flex flex-col')}>
        {children}
      </div>
      <div className="absolute -top-3 left-3 right-3 z-2 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1 rounded-8 border border-brand-default bg-background-subtle px-2 py-1 text-brand-default typo-caption2">
          <MagicIcon size={IconSize.Size16} />
          <span className="truncate">Found by your agent</span>
        </span>
        <button
          type="button"
          aria-expanded={showReason}
          aria-controls={reasonId}
          onClick={() => setShowReason((value) => !value)}
          className="shrink-0 rounded-8 border border-border-subtlest-tertiary bg-background-subtle px-2 py-1 text-brand-default typo-caption2"
        >
          {showReason ? 'Less' : 'Why this?'}
        </button>
      </div>
      {showReason && (
        <div
          id={reasonId}
          className="absolute left-3 right-3 top-6 z-3 rounded-12 border border-border-subtlest-secondary bg-background-popover p-4 shadow-2"
        >
          <div className="mb-2 flex items-center gap-2 text-brand-default typo-callout">
            <MagicIcon size={IconSize.Small} />
            {agentName}
          </div>
          <p className="text-text-secondary typo-callout">
            Your agent is watching for practical guides and fresh ideas on the
            topics you care about.
          </p>
          <p className="mt-3 text-text-tertiary typo-caption2">
            Internal concept · Sample agent attribution
          </p>
        </div>
      )}
    </div>
  );
};

export const renderAgentFeedMockPost = (
  post: Post,
  index: number,
  card: ReactElement,
): ReactElement => {
  if (index !== 1 && index !== 4) {
    return card;
  }

  return (
    <AgentFeedMockCard
      key={post.id}
      agentName={index === 1 ? 'Your dev radar' : 'Engineering deep dives'}
    >
      {card}
    </AgentFeedMockCard>
  );
};
