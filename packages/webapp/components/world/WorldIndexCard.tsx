import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { IndexedWorld } from '../../graphql/worldIndex';
import { WorldTopicBars } from './WorldTopicBars';

interface WorldIndexCardProps {
  world: IndexedWorld;
  /** Why this world is in the section it is in, when there is a reason. */
  event?: string;
  className?: string;
}

export function WorldIndexCard({
  world,
  event,
  className,
}: WorldIndexCardProps): ReactElement {
  return (
    <Link href={`/world/${world.user.username}`} passHref prefetch={false}>
      <a
        className={classNames(
          'flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 transition-colors hover:border-border-subtlest-secondary',
          className,
        )}
      >
        {!!event && (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Secondary}
            bold
            className="w-fit rounded-8 border border-border-subtlest-tertiary px-2 py-1"
          >
            {event}
          </Typography>
        )}

        <div className="flex min-w-0 items-center gap-2">
          <ProfilePicture
            user={world.user}
            size={ProfileImageSize.Medium}
            nativeLazyLoading
          />
          <div className="flex min-w-0 flex-col">
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Footnote}
              bold
              truncate
            >
              {world.user.name}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              truncate
            >
              @{world.user.username}
            </Typography>
          </div>
        </div>

        <WorldTopicBars topics={world.topTopics} />

        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="mt-auto tabular-nums"
          truncate
        >
          {world.name ? `${world.name} · ` : ''}
          {world.topics} topics · {world.articles.toLocaleString()} articles
        </Typography>
      </a>
    </Link>
  );
}
