import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { SourceTooltip } from '../../../graphql/sources';
import { FollowButton } from '../../contentPreference/FollowButton';
import { useContentPreferenceStatusQuery } from '../../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import useShowFollowAction from '../../../hooks/useShowFollowAction';
import { ButtonVariant } from '../../buttons/Button';
import Link from '../../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import HoverCard from '../../cards/common/HoverCard';
import SourceEntityCard from '../../cards/entity/SourceEntityCard';

type SourceStripProps = {
  source: SourceTooltip;
  className?: string;
  compact?: boolean;
  followButtonVariant?: ButtonVariant;
};

export function SourceStrip({
  source,
  className,
  compact = false,
  followButtonVariant = ButtonVariant.Secondary,
}: SourceStripProps): ReactElement | null {
  const sourceId = source?.id ?? '';
  const sourceName = source?.name ?? '';
  const { showActionBtn } = useShowFollowAction({
    entityId: sourceId,
    entityType: ContentPreferenceType.Source,
  });
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: sourceId,
    entity: ContentPreferenceType.Source,
  });
  if (!source?.id || !source.name || !source.image || !source.permalink) {
    return null;
  }

  const sourceHandle = source.handle ? `@${source.handle}` : null;

  return (
    <div
      className={classNames(
        'flex min-w-0 items-center',
        compact ? 'gap-3' : 'gap-2',
        className,
      )}
    >
      <HoverCard
        appendTo={globalThis?.document?.body}
        side="top"
        align="start"
        sideOffset={10}
        trigger={
          <div
            className={classNames(
              'flex min-w-0 flex-1 items-center rounded-10',
              compact ? 'gap-3 px-0 py-0' : 'gap-3 px-1 py-0.5',
            )}
          >
            <Link passHref href={source.permalink} prefetch={false}>
              <a
                className="shrink-0"
                aria-label={`Go to ${source.name}`}
                title={source.name}
              >
                <img
                  src={source.image}
                  alt=""
                  className={classNames(
                    'rounded-full',
                    compact ? 'size-10' : 'size-8',
                  )}
                  loading="lazy"
                  aria-hidden
                />
              </a>
            </Link>
            <div className="flex min-w-0 flex-col">
              <Link passHref href={source.permalink} prefetch={false}>
                <Typography
                  tag={TypographyTag.Link}
                  type={
                    compact ? TypographyType.Callout : TypographyType.Subhead
                  }
                  color={TypographyColor.Primary}
                  className="truncate hover:underline focus-visible:underline"
                  title={source.name}
                  bold
                >
                  {source.name}
                </Typography>
              </Link>
              {!compact && sourceHandle && (
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="truncate"
                >
                  {sourceHandle}
                </Typography>
              )}
            </div>
          </div>
        }
      >
        <SourceEntityCard source={source} />
      </HoverCard>
      {showActionBtn && (
        <FollowButton
          entityId={sourceId}
          entityName={sourceName}
          type={ContentPreferenceType.Source}
          variant={followButtonVariant}
          status={contentPreference?.status}
          showSubscribe={false}
          buttonClassName={compact ? '!h-7 !px-2' : '!h-8'}
        />
      )}
    </div>
  );
}
