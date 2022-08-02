import { useEffect } from 'react';

function CallbackPage() {
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    window.opener.postMessage({ flow: params.flow }, '*');
    window.close();
  }, []);
}

export default CallbackPage;
