import React, {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ReactElement,
} from 'react';
import { Squad } from '../../../../graphql/sources';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { Separator } from '../../../cards/common';
import { largeNumberFormat } from '../../../../lib';
import { SquadJoinButtonWrapper } from './common/SquadJoinButton';
import { ButtonVariant } from '../../../buttons/common';
import { SquadCardAction } from './common/types';
import { ArrowIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import { CardLink } from '../../../cards/Card';

interface SquadListBaseProps {
  squad: Squad;
  isUserSquad?: boolean;
  elementProps?:
    | HTMLAttributes<HTMLSpanElement>
    | AnchorHTMLAttributes<HTMLAnchorElement>;
}

interface UserSquadProps extends SquadListBaseProps {
  isUserSquad: true;
  action?: never; // action is not allowed when isUserSquad is true
}

interface NonUserSquadProps extends SquadListBaseProps {
  isUserSquad?: false;
  action: SquadCardAction; // action is required when isUserSquad is false
}

type SquadListProps = UserSquadProps | NonUserSquadProps;

export const SquadList = ({
  squad,
  action,
  isUserSquad,
}: SquadListProps): ReactElement => {
  return (
    <div className="relative flex flex-row items-center gap-4">
      <CardLink href={squad.permalink} rel="noopener" title={squad.name} />
      <img
        src={squad.image}
        alt={`avatar of ${squad.handle}`}
        className="size-14 rounded-full"
      />
      <div className="flex w-0 flex-grow flex-col">
        <Typography type={TypographyType.Callout} bold truncate>
          {squad.name}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          truncate
        >
          @{squad.handle}
          {!isUserSquad && <Separator />}
          {!isUserSquad && (
            <strong>{largeNumberFormat(squad.membersCount)}</strong>
          )}
        </Typography>
      </div>
      {isUserSquad ? (
        <ArrowIcon
          className="ml-auto rotate-90 text-text-tertiary"
          size={IconSize.Small}
        />
      ) : (
        <SquadJoinButtonWrapper
          action={action}
          source={squad}
          variant={ButtonVariant.Float}
          className={{
            squadJoinButton: '!btn-tertiaryFloat',
          }}
        />
      )}
    </div>
  );
};
