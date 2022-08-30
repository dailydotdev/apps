import { AuthEvent } from '@dailydotdev/shared/src/lib/kratos';
import { ReactElement, useEffect } from 'react';

function CallbackPage(): ReactElement {
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const eventKey = params.flow ? AuthEvent.Registration : AuthEvent.Login;
    window.opener.postMessage({ ...params, eventKey }, '*');
    window.close();
  }, []);

  return null;
}

export default CallbackPage;
