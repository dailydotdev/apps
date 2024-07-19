import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { SimpleTooltip } from '../tooltips';
import { Source } from '../../graphql/sources';
import { isTesting } from '../../lib/constants';
import { useSourceActionsNotify } from '../../hooks';
import { useAuthContext } from '../../contexts/AuthContext';

export type SourceSubscribeButtonProps = {
  className?: string;
  source: Pick<Source, 'id'>;
  variant?: ButtonVariant;
};

type SourceSubscribeButtonViewProps = {
  className?: string;
  isFetching: boolean;
  onClick: () => void;
  variant: ButtonVariant;
};

const SourceSubscribeButtonRegular = ({
  className,
  isFetching,
  variant,
  onClick,
}: SourceSubscribeButtonViewProps): ReactElement => {
  return (
    <Button
      className={className}
      variant={variant}
      disabled={isFetching}
      onClick={onClick}
      size={ButtonSize.Small}
    >
      Subscribe
    </Button>
  );
};

const SourceSubscribeButtonSubscribed = ({
  className,
  isFetching,
  onClick,
}: SourceSubscribeButtonViewProps): ReactElement => {
  return (
    <SimpleTooltip forceLoad={!isTesting} content="Unsubscribe">
      <Button
        className={className}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        disabled={isFetching}
        onClick={onClick}
      >
        Subscribed
      </Button>
    </SimpleTooltip>
  );
};

const SourceSubscribeButton = ({
  className,
  source,
  variant = ButtonVariant.Primary,
}: SourceSubscribeButtonProps): ReactElement => {
  const { isLoggedIn } = useAuthContext();

  const { haveNotifications, onNotify, isReady } = useSourceActionsNotify({
    source,
  });

  const ButtonComponent = haveNotifications
    ? SourceSubscribeButtonSubscribed
    : SourceSubscribeButtonRegular;

  return (
    <>
      <ButtonComponent
        className={className}
        isFetching={isLoggedIn && !isReady}
        onClick={onNotify}
        variant={variant}
      />
    </>
  );
};

export { SourceSubscribeButton };
