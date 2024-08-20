import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { SourceType, Squad } from '../../../../../graphql/sources';
import { SquadJoinButton } from '../../../SquadJoinButton';
import { Origin } from '../../../../../lib/log';
import { Button, ButtonVariant } from '../../../../buttons/Button';
import { SquadCardAction } from './types';

interface SourceJoinButtonProps {
  action?: SquadCardAction;
  source?: Squad;
  variant: ButtonVariant.Float | ButtonVariant.Secondary;
  className?: {
    simpleButton?: string;
    squadJoinButton?: string;
  };
}
export const SquadJoinButtonWrapper = ({
  action,
  source,
  variant,
  className,
}: SourceJoinButtonProps): ReactElement => {
  const router = useRouter();

  return !!action &&
    action?.type === 'action' &&
    source?.type === SourceType.Squad ? (
    <SquadJoinButton
      className={{ button: className?.squadJoinButton }}
      squad={source}
      origin={Origin.SquadDirectory}
      onSuccess={() => router.push(source?.permalink)}
      joinText={action?.text}
      data-testid="squad-action"
    />
  ) : (
    <Button
      variant={variant}
      className={className?.simpleButton}
      onClick={action?.type === 'action' ? action?.onClick : undefined}
      tag={action?.type === 'link' ? 'a' : undefined}
      href={action?.type === 'link' && action.href}
      target={action?.target ? action.target : '_self'}
      rel="noopener"
      data-testid="source-action"
    >
      {action?.text}
    </Button>
  );
};
