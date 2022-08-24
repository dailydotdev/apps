import { ReactElement, useEffect } from 'react';

function CallbackPage(): ReactElement {
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    window.opener.postMessage(params, '*');
    window.close();
  }, []);

  return null;
}

export default CallbackPage;
