import type { ReactElement } from 'react';
import React from 'react';
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
};

export function SourceStrip({ source }: SourceStripProps): ReactElement | null {
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
    <div className="flex min-w-0 items-center gap-2">
      <HoverCard
        appendTo={globalThis?.document?.body}
        side="top"
        align="start"
        sideOffset={10}
        trigger={
          <div className="group flex min-w-0 flex-1 items-center gap-3 rounded-10 px-1 py-0.5">
            <Link passHref href={source.permalink} prefetch={false}>
              <a
                className="shrink-0"
                aria-label={`Go to ${source.name}`}
                title={source.name}
              >
                <img
                  src={source.image}
                  alt=""
                  className="size-8 rounded-full"
                  loading="lazy"
                  aria-hidden
                />
              </a>
            </Link>
            <div className="flex min-w-0 flex-col">
              <Link passHref href={source.permalink} prefetch={false}>
                <Typography
                  tag={TypographyTag.Link}
                  type={TypographyType.Subhead}
                  color={TypographyColor.Primary}
                  className="truncate group-hover:underline group-focus-visible:underline"
                  title={source.name}
                  bold
                >
                  {source.name}
                </Typography>
              </Link>
              {sourceHandle && (
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
          variant={ButtonVariant.Secondary}
          status={contentPreference?.status}
          showSubscribe={false}
          buttonClassName="!h-8"
        />
      )}
    </div>
  );
}
