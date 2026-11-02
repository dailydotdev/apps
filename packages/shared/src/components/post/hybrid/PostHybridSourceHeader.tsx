import type { ReactElement } from 'react';
import React from 'react';
import type { SourceTooltip } from '../../../graphql/sources';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import HoverCard from '../../cards/common/HoverCard';
import SourceEntityCard from '../../cards/entity/SourceEntityCard';
import { FollowButton } from '../../contentPreference/FollowButton';
import { ButtonVariant } from '../../buttons/Button';
import Link from '../../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';

/** A 40px logo, the name in callout, a hover card and a subtle Follow. */
export const PostHybridSourceHeader = ({
  source,
}: {
  source: SourceTooltip;
}): ReactElement => (
  <div className="flex min-w-0 shrink items-center gap-3">
    <HoverCard
      appendTo={globalThis?.document?.body}
      side="top"
      align="start"
      sideOffset={10}
      trigger={
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-10">
          <Link passHref href={source.permalink} prefetch={false}>
            <a
              className="shrink-0"
              aria-label={`Go to ${source.name}`}
              title={source.name}
            >
              <img
                src={source.image}
                alt=""
                className="size-10 rounded-full"
                loading="lazy"
                aria-hidden
              />
            </a>
          </Link>
          <Link passHref href={source.permalink} prefetch={false}>
            <Typography
              tag={TypographyTag.Link}
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              className="min-w-0 shrink truncate hover:underline focus-visible:underline"
              title={source.name}
              bold
            >
              {source.name}
            </Typography>
          </Link>
        </div>
      }
    >
      <SourceEntityCard source={source} />
    </HoverCard>
    <FollowButton
      entityId={source.id ?? ''}
      entityName={source.name}
      type={ContentPreferenceType.Source}
      variant={ButtonVariant.Subtle}
      showSubscribe={false}
      buttonClassName="!h-7 !px-2"
    />
  </div>
);
