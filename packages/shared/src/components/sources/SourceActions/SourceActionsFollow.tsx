import { Fragment, ReactElement } from 'react';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import SimpleTooltip from '../../tooltips/SimpleTooltip';
import { Button } from '../../buttons/Button';

interface SourceActionsFollowProps {
  className?: string;
  isFetching: boolean;
  isSubscribed: boolean;
  onClick: () => void;
  variant: ButtonVariant;
}

const SourceActionsFollow = (props: SourceActionsFollowProps): ReactElement => {
  const { className, isSubscribed, isFetching, onClick, variant } = props;

  const WrapperEl = isSubscribed ? SimpleTooltip : Fragment;
  const wrapperProps = isSubscribed ? { content: 'Unsubscribe' } : {};

  return (
    <WrapperEl {...wrapperProps}>
      <Button
        className={className}
        disabled={isFetching}
        onClick={onClick}
        size={ButtonSize.Small}
        variant={variant}
      >
        {isSubscribed ? 'Subscribed' : 'Subscribe'}
      </Button>
    </WrapperEl>
  );
};

export default SourceActionsFollow;
