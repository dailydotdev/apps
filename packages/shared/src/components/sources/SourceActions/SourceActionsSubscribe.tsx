import { Fragment, ReactElement } from 'react';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import SimpleTooltip from '../../tooltips/SimpleTooltip';
import { Button } from '../../buttons/Button';

interface SourceActionsSubscribeProps {
  className?: string;
  isFetching: boolean;
  isSubscribed: boolean;
  onClick: () => void;
  variant: ButtonVariant;
}

const SourceActionsSubscribe = (
  props: SourceActionsSubscribeProps,
): ReactElement => {
  const { className, isSubscribed, isFetching, onClick, variant } = props;

  const WrapperEl = isSubscribed ? SimpleTooltip : Fragment;

  return (
    <WrapperEl content="Unsubscribe">
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

export default SourceActionsSubscribe;
