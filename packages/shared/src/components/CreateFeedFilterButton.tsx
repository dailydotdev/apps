import React, { ReactElement, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { Button, ButtonProps } from './buttons/Button';
import { LoginTrigger } from '../lib/analytics';

interface CreateFeedFilterButtonProps extends ButtonProps<'button'> {
  feedFilterModalType: string;
}

export default function CreateFeedFilterButton({
  feedFilterModalType,
  ...props
}: CreateFeedFilterButtonProps): ReactElement {
  const { showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const onCreate = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent({
      event_name: 'click',
      target_type: LoginTrigger.CreateFeedFilters,
      target_id: `feed-filters-${feedFilterModalType}`,
    });
    showLogin(LoginTrigger.CreateFeedFilters);
    props.onClick(e);
  };
  return (
    <Button {...props} type="submit" onClick={onCreate}>
      Create
    </Button>
  );
}
