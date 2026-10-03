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
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import { SquadOptionsMenu } from '../../../features/squads/components/header/SquadOptionsMenu';
import { SquadPageContextProvider } from '../../../features/squads/SquadPageContext';
import { Separator } from '../common/common';
import EntityDescription from './EntityDescription';
import EntityCard from './EntityCard';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import useShowFollowAction from '../../../hooks/useShowFollowAction';
import { hasSquadFeature } from '../../../features/squads/lib/features';
import { VerifiedSquadBadge } from '../../../features/squads/components/VerifiedSquad';

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
    entityId: squad?.id ?? '',
    entityType: ContentPreferenceType.Source,
  });

  if (!squad?.id || !squad.name || !squad.image || !squad.permalink) {
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
              }}
              squad={squad}
              origin={origin}
            />
            <SquadPageContextProvider squad={squad} isViewerReady>
              <SquadOptionsMenu
                variant={ButtonVariant.Tertiary}
                className="laptop:mouse:invisible laptop:mouse:group-hover/menu:visible"
              />
            </SquadPageContextProvider>
          </>
        )
      }
    >
      <div className="mt-3 flex w-full flex-col gap-2">
        <Link passHref href={permalink}>
          <Typography
            tag={TypographyTag.Link}
            className="flex items-center gap-1"
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            bold
          >
            {name}
            {hasSquadFeature(squad, 'verified') && <VerifiedSquadBadge />}
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
            {largeNumberFormat(membersCount ?? 0)} Members
          </Typography>
          <Separator />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(flags?.totalUpvotes ?? 0)} Upvotes
          </Typography>
        </div>
      </div>
    </EntityCard>
  );
};

export default SquadEntityCard;
