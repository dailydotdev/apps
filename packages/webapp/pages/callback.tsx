import { postWindowMessage } from '@dailydotdev/shared/src/lib/func';
import { AuthEvent } from '@dailydotdev/shared/src/lib/kratos';
import { ReactElement, useContext, useEffect } from 'react';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';

function CallbackPage(): ReactElement {
  const { logEvent } = useContext(LogContext);
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const eventKey = params.login
      ? AuthEvent.Login
      : AuthEvent.SocialRegistration;
    logEvent({
      event_name: 'registration callback',
      extra: JSON.stringify(params),
    });
    const search = new URLSearchParams(params);
    try {
      if (!window.opener && params.flow && params.settings) {
        window.location.replace(`/reset-password?${search}`);
        return;
      }
      postWindowMessage(eventKey, params);
      window.close();
    } catch (err) {
      const url = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?${search}`;
      window.location.replace(url);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default CallbackPage;
