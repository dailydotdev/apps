import React, { ComponentProps, ReactElement } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Squad } from '../../../graphql/sources';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Separator } from '../common';
import { largeNumberFormat } from '../../../lib';
import { CardLink } from '../Card';
import { SquadActionButton } from '../../squads/SquadActionButton';
import { Origin } from '../../../lib/log';
import { Image, ImageType } from '../../image/Image';
import { ButtonVariant } from '../../buttons/common';

interface SquadListProps extends ComponentProps<'div'> {
  squad: Squad;
  shouldShowCount?: boolean;
}

export const SquadList = ({
  squad,
  shouldShowCount = true,
  ...attrs
}: SquadListProps): ReactElement => {
  const router = useRouter();
  const { image, name, permalink } = squad;

  return (
    <div {...attrs} className="relative flex flex-row items-center gap-4">
      <Link href={permalink} legacyBehavior>
        <CardLink href={permalink} rel="noopener" title={name} />
      </Link>
      <Image
        className="size-14 rounded-full"
        src={image}
        alt={`${name} source`}
        type={ImageType.Squad}
      />
      <div className="flex max-w-[calc(100%-10rem)] flex-1 flex-col">
        <Typography type={TypographyType.Callout} bold truncate>
          {name}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          truncate
        >
          @{squad.handle}
          {shouldShowCount && <Separator />}
          {shouldShowCount && (
            <strong data-testid="squad-members-count">
              {largeNumberFormat(squad.membersCount)} members
            </strong>
          )}
        </Typography>
      </div>
      <SquadActionButton
        className={{ button: 'z-0' }}
        squad={squad}
        origin={Origin.SquadDirectory}
        onSuccess={() => router.push(permalink)}
        copy={{ join: 'Join', view: 'View' }}
        data-testid="squad-action"
        showViewSquadIfMember
        buttonVariants={[ButtonVariant.Secondary, ButtonVariant.Float]}
      />
    </div>
  );
};
