import React from 'react';
import Link from 'next/link';
import EntityCard from './EntityCard';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import type { Origin } from '../../../lib/log';
import { largeNumberFormat } from '../../../lib';
import { SquadActionButton } from '../../squads/SquadActionButton';
import { MenuIcon, SourceIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useSquad } from '../../../hooks';
import { ContextMenuIds } from '../../../hooks/constants';
import useContextMenu from '../../../hooks/useContextMenu';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import SquadHeaderMenu from '../../squads/SquadHeaderMenu';
import { Separator } from '../common/common';

const SquadEntityCard = ({
  handle,
  origin,
}: {
  handle: string;
  origin: Origin;
}) => {
  const { squad } = useSquad({ handle });
  const { onMenuClick } = useContextMenu({
    id: ContextMenuIds.SquadMenuContext,
  });
  if (!squad) {
    return null;
  }

  const { description, name, id, image, membersCount, flags } = squad || {};
  return (
    <EntityCard
      image={image}
      type="squad"
      className={{
        image: 'size-10 rounded-full',
      }}
      entityName={name}
      actionButtons={
        <>
          <Button
            variant={ButtonVariant.Option}
            icon={<MenuIcon />}
            onClick={onMenuClick}
            size={ButtonSize.Small}
          />
          <SquadHeaderMenu squad={squad} className="z-[9999]" />
          <SquadActionButton
            size={ButtonSize.Small}
            copy={{
              join: 'Join',
              leave: 'Leave',
            }}
            squad={squad}
            origin={origin}
          />
        </>
      }
    >
      <div className="flex w-full flex-col gap-2">
        <Typography
          className="flex"
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          {name}
        </Typography>
        {description && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {description?.length <= 100 ? (
              description
            ) : (
              <>
                {description.slice(0, 100)}...{' '}
                <Link className="text-text-link" href={`/squads/${id}`}>
                  Read more
                </Link>
              </>
            )}
          </Typography>
        )}
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
