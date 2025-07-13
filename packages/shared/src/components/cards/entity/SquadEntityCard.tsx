import React from 'react';
import Link from '../../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import type { Origin } from '../../../lib/log';
import { largeNumberFormat } from '../../../lib';
import { SquadActionButton } from '../../squads/SquadActionButton';
import { SourceIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useSquad } from '../../../hooks';
import { ButtonSize } from '../../buttons/Button';
import SquadHeaderMenu from '../../squads/SquadHeaderMenu';
import { Separator } from '../common/common';
import EntityDescription from './EntityDescription';
import EntityCard from './EntityCard';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import useShowFollowAction from '../../../hooks/useShowFollowAction';

type SquadEntityCardProps = {
  handle: string;
  origin: Origin;
  className?: {
    container?: string;
  };
};

const SquadEntityCard = ({
  handle,
  origin,
  className,
}: SquadEntityCardProps) => {
  const { squad } = useSquad({ handle });
  const { isLoading } = useShowFollowAction({
    entityId: squad?.id,
    entityType: ContentPreferenceType.Source,
  });

  if (!squad) {
    return null;
  }

  const { description, name, image, membersCount, flags, permalink } =
    squad || {};
  return (
    <EntityCard
      permalink={permalink}
      image={image}
      type="squad"
      className={{
        container: className?.container,
        image: 'size-10 rounded-full',
      }}
      entityName={name}
      actionButtons={
        !isLoading && (
          <>
            <SquadActionButton
              className={{
                button: 'order-6',
              }}
              size={ButtonSize.Small}
              copy={{
                join: 'Join',
                leave: 'Leave',
              }}
              squad={squad}
              origin={origin}
            />
            <SquadHeaderMenu
              squad={squad}
              className={{
                button: '!btn-tertiary invisible group-hover/menu:visible',
              }}
            />
          </>
        )
      }
    >
      <div className="mt-3 flex w-full flex-col gap-2">
        <Link passHref href={permalink}>
          <Typography
            tag={TypographyTag.Link}
            className="flex"
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            bold
          >
            {name}
          </Typography>
        </Link>
        {description && <EntityDescription copy={description} length={100} />}
        <div className="flex items-center text-text-tertiary">
          {flags?.featured && (
            <>
              <div className="flex items-center gap-1 text-brand-default">
                <SourceIcon size={IconSize.Size16} />
                <Typography type={TypographyType.Footnote}>Featured</Typography>
              </div>
              <Separator />
            </>
          )}
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(membersCount)} Members
          </Typography>
          <Separator />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(flags?.totalUpvotes)} Upvotes
          </Typography>
        </div>
      </div>
    </EntityCard>
  );
};

export default SquadEntityCard;
