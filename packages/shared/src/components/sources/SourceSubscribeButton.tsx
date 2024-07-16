import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { BellAddIcon, BellSubscribedIcon } from '../icons';
import { SimpleTooltip } from '../tooltips';
import { Source } from '../../graphql/sources';
import { isTesting } from '../../lib/constants';
import { useSourceSubscription } from '../../hooks';
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
  const { isFollowing, isSubscribed, onSubscribe, onFollowing, isReady } =
    useSourceSubscription({
      source,
    });

  const ButtonComponent = isSubscribed
    ? SourceSubscribeButtonSubscribed
    : SourceSubscribeButtonRegular;

  const follow = {
    icon: isFollowing ? <BellSubscribedIcon /> : <BellAddIcon />,
    label: `${isFollowing ? 'Disable' : 'Enable'} notifications`,
    variant: isFollowing ? ButtonVariant.Tertiary : ButtonVariant.Secondary,
  };

  return (
    <>
      <ButtonComponent
        className={className}
        isFetching={isLoggedIn && !isReady}
        onClick={onSubscribe}
        variant={variant}
      />
      {isSubscribed && (
        <SimpleTooltip content={follow.label}>
          <Button
            aria-label={follow.label}
            icon={follow.icon}
            onClick={onFollowing}
            size={ButtonSize.Small}
            title={follow.label}
            variant={follow.variant}
          />
        </SimpleTooltip>
      )}
    </>
  );
};

export { SourceSubscribeButton };
