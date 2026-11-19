import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import {
  AiIcon,
  ArrowIcon,
  SparkleIcon,
  TrendingIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import Link from '../../components/utilities/Link';
import { useLogContext } from '../../contexts/LogContext';
import { webappUrl } from '../../lib/constants';
import { LogEvent, TargetType } from '../../lib/log';
import type { PatchyQuickRead } from './patchyAssistant';
import { getPatchyQuickReads } from './patchyAssistant';

type MenuItem = 'read' | 'trending' | 'ask';

const rowClassName =
  'flex w-full items-center gap-2 rounded-10 px-2 py-1.5 text-left typo-callout hover:bg-surface-hover focus-outline';

const Row = ({
  icon,
  children,
  className,
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={classNames('flex min-w-0 flex-1 items-center gap-2', className)}
  >
    <span className="flex size-5 shrink-0 items-center justify-center text-text-tertiary">
      {icon}
    </span>
    <span className="min-w-0 flex-1 truncate">{children}</span>
  </span>
);

// What you can ask Patchy for, in his corner of the Streak panel: something
// short to read (from feeds you already loaded), what's trending, or
// anything else through Ask.
export const PatchyMenu = ({
  onNavigate,
}: {
  onNavigate?: () => void;
}): ReactElement => {
  const client = useQueryClient();
  const { logEvent } = useLogContext();
  const [picks, setPicks] = useState<PatchyQuickRead[] | null>(null);

  const log = (item: MenuItem) =>
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.PatchyMenu,
      target_id: item,
    });

  return (
    <nav aria-label="Ask Patchy" className="flex flex-col">
      <button
        type="button"
        className={rowClassName}
        aria-expanded={!!picks}
        onClick={() => {
          if (picks) {
            setPicks(null);
            return;
          }
          log('read');
          setPicks(getPatchyQuickReads(client, { limit: 3 }));
        }}
      >
        <Row icon={<SparkleIcon size={IconSize.Size16} />}>What to read?</Row>
        <ArrowIcon
          size={IconSize.Size16}
          className={classNames(
            'text-text-tertiary transition-transform',
            picks ? 'rotate-180' : 'rotate-90',
          )}
        />
      </button>
      {picks && (
        <div className="flex flex-col gap-1 py-1 pl-10 pr-1">
          {picks.length ? (
            picks.map((post) => (
              <Link key={post.id} href={post.commentsPermalink} passHref>
                <a
                  href={post.commentsPermalink}
                  className="flex items-center gap-2 rounded-8 px-2 py-1 hover:bg-surface-hover"
                  onClick={onNavigate}
                >
                  <span className="min-w-0 flex-1 truncate typo-footnote">
                    {post.title}
                  </span>
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    {post.readTime}m
                  </Typography>
                </a>
              </Link>
            ))
          ) : (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="px-2 py-1"
            >
              Nothing short in your feed right now. Scroll a bit and ask me
              again.
            </Typography>
          )}
        </div>
      )}
      <Link href={`${webappUrl}highlights`} passHref>
        <a
          href={`${webappUrl}highlights`}
          className={rowClassName}
          onClick={() => {
            log('trending');
            onNavigate?.();
          }}
        >
          <Row icon={<TrendingIcon size={IconSize.Size16} />}>
            What’s trending?
          </Row>
        </a>
      </Link>
      <Link href={`${webappUrl}agents/ask`} passHref>
        <a
          href={`${webappUrl}agents/ask`}
          className={rowClassName}
          onClick={() => {
            log('ask');
            onNavigate?.();
          }}
        >
          <Row icon={<AiIcon size={IconSize.Size16} />}>Ask anything</Row>
        </a>
      </Link>
    </nav>
  );
};
