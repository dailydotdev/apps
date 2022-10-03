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
  }, []);

  return null;
}

export default CallbackPage;
