import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../../graphql/posts';
import type { Squad } from '../../../../graphql/sources';
import Link from '../../../../components/utilities/Link';
import { Image, ImageType } from '../../../../components/image/Image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Separator } from '../../../../components/cards/common/common';
import { VerifiedSquadBadge } from '../VerifiedSquad';
import { SquadJoinButton } from './SquadJoinButton';
import { PromotedLabel, PromotedSquad } from './PromotedSquad';
import { getSquadMembersLabel, isVerifiedSquad } from './common';

interface SquadDiscoverRowProps {
  squad: Squad;
  ad?: Ad;
  size?: 'medium' | 'large';
  description?: boolean;
  /** Off where every row is already joined, like My Squads. */
  join?: boolean;
  /** A trailing control, such as the favorite star. */
  action?: ReactNode;
  className?: string;
}

// The whole row opens the squad; Join sits above the link.
export const SquadDiscoverRow = ({
  squad,
  ad,
  size = 'medium',
  description = false,
  join = true,
  action,
  className,
}: SquadDiscoverRowProps): ReactElement => (
  <PromotedSquad ad={ad}>
    {({ ref, onClickAd, trackers }) => (
      <article
        ref={ref}
        className={classNames(
          'group/squad-row relative flex items-center rounded-16 py-2',
          size === 'large' ? 'gap-4' : 'gap-3',
          className,
        )}
      >
        <Link href={squad.permalink} passHref>
          <a
            href={squad.permalink}
            title={squad.description}
            aria-label={`Open ${squad.name}`}
            className="absolute inset-0 rounded-16"
            onClick={onClickAd}
          />
        </Link>
        <Image
          src={squad.image}
          alt={`${squad.name} source`}
          type={ImageType.Squad}
          className={classNames(
            'shrink-0 rounded-full object-cover',
            size === 'large'
              ? 'size-16 bg-background-subtle laptop:size-20'
              : 'size-12',
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-center gap-1">
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Callout}
              bold
              truncate
            >
              {squad.name}
            </Typography>
            {isVerifiedSquad(squad) && (
              <VerifiedSquadBadge className="size-4 shrink-0" />
            )}
          </div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="tabular-nums"
            truncate
          >
            {!!ad && (
              <>
                <PromotedLabel />
                <Separator />
              </>
            )}
            {getSquadMembersLabel(squad.membersCount)}
            <Separator />@{squad.handle}
          </Typography>
          {description && !!squad.description && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
              className="mt-0.5 line-clamp-1"
            >
              {squad.description}
            </Typography>
          )}
        </div>
        {join && <SquadJoinButton squad={squad} />}
        {action}
        {trackers}
      </article>
    )}
  </PromotedSquad>
);
