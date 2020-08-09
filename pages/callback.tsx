import React, { ReactElement, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { authenticate } from '../lib/user';

export default function CallbackPage(): ReactElement {
  useEffect(() => {
    const cookies = new Cookies();
    const query = new URLSearchParams(window.location.search);
    if (query.get('code') && cookies.get('verifier')) {
      const redirectUri = `${location.origin}${query.get('redirect')}`;
      authenticate({
        code: query.get('code'),
        verifier: cookies.get('verifier'),
      }).then(() => {
        window.location.replace(redirectUri);
      });
    } else {
      window.location.replace('https://daily.dev');
    }
  }, []);

  return <div />;
}
