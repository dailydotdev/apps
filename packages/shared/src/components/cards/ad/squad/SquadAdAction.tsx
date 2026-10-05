import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SquadActionButton } from '../../../squads/SquadActionButton';
import { Origin } from '../../../../lib/log';
import { ButtonVariant } from '../../../buttons/common';
import Link from '../../../utilities/Link';
import type { ButtonSize } from '../../../buttons/Button';
import { Button } from '../../../buttons/Button';
import type { Squad } from '../../../../graphql/sources';

interface SquadAdActionProps {
  squad: Squad;
  onJustJoined: () => void;
  shouldShowAction: boolean;
  className?: string;
  origin?: Origin;
  size?: ButtonSize;
}

export function SquadAdAction({
  squad,
  onJustJoined,
  shouldShowAction,
  className,
  origin = Origin.Feed,
  size,
}: SquadAdActionProps): ReactElement {
  if (shouldShowAction) {
    return (
      <SquadActionButton
        squad={squad}
        origin={origin}
        size={size}
        alwaysShow
        buttonVariants={[ButtonVariant.Secondary, ButtonVariant.Subtle]}
        onSuccess={() => onJustJoined()}
        className={{ button: classNames('mt-auto', className) }}
      />
    );
  }

  return (
    <Link href={squad.permalink}>
      <Button
        tag="a"
        href={squad.permalink}
        variant={ButtonVariant.Subtle}
        size={size}
        className={classNames('mt-auto w-full', className)}
      >
        View Squad
      </Button>
    </Link>
  );
}
