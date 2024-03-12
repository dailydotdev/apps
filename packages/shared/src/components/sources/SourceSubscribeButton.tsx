import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { BellSubscribedIcon } from '../icons';
import { SimpleTooltip } from '../tooltips';
import { Source } from '../../graphql/sources';
import { isTesting } from '../../lib/constants';
import { useSourceSubscription } from '../../hooks';
import { withExperiment } from '../withExperiment';
import { feature } from '../../lib/featureManagement';
import { SourceSubscribeExperiment } from '../../lib/featureValues';
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
        icon={<BellSubscribedIcon />}
        disabled={isFetching}
        onClick={onClick}
      />
    </SimpleTooltip>
  );
};

const SourceSubscribeButton = ({
  className,
  source,
  variant = ButtonVariant.Primary,
}: SourceSubscribeButtonProps): ReactElement => {
  const { isLoggedIn } = useAuthContext();
  const { isSubscribed, onSubscribe, isReady } = useSourceSubscription({
    source,
  });

  const ButtonComponent = isSubscribed
    ? SourceSubscribeButtonSubscribed
    : SourceSubscribeButtonRegular;

  return (
    <ButtonComponent
      className={className}
      isFetching={isLoggedIn && !isReady}
      onClick={onSubscribe}
      variant={variant}
    />
  );
};

const SourceSubscribeButtonExperiment = withExperiment(SourceSubscribeButton, {
  feature: feature.sourceSubscribe,
  value: SourceSubscribeExperiment.V1,
});

export { SourceSubscribeButtonExperiment as SourceSubscribeButton };
