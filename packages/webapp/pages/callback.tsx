import { postWindowMessage } from '@dailydotdev/shared/src/lib/func';
import { AuthEvent } from '@dailydotdev/shared/src/lib/kratos';
import { ReactElement, useEffect } from 'react';

function CallbackPage(): ReactElement {
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const eventKey = params.login
      ? AuthEvent.Login
      : AuthEvent.SocialRegistration;
    if (!window.opener && params.flow && params.settings) {
      const search = new URLSearchParams(params);
      window.location.replace(`/reset-password?${search}`);
      return;
    }
    postWindowMessage(eventKey, params);
    window.close();
  }, []);

  return null;
}

export default CallbackPage;
