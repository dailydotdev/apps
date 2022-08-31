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
    postWindowMessage(eventKey, params);
    window.close();
  }, []);

  return null;
}

export default CallbackPage;
