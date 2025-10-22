import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { USER_REFERRAL_RECRUITER_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { useBackgroundRequest } from '@dailydotdev/shared/src/hooks/companion';
import { useRequestProtocol } from '@dailydotdev/shared/src/hooks/useRequestProtocol';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const containerClass = 'msg-s-message-list__quick-replies-container';

export const useDomObserver = () => {
  const [id, setId] = useState<string>(null);
  const { user } = useAuthContext();
  const queryKey = generateQueryKey(RequestKey.InviteRecruiter, user, id);
  useBackgroundRequest(queryKey, {
    enabled: !!id,
    callback: ({ res }) => {
      const { cta, message } = res.userReferralRecruiter;
      // store it maybe
      // generate the ui - it must be a link to click with the message from the response and link
      const container = document.querySelector(`.${containerClass}`);
      const constructed = document.createElement('button');
      constructed.style.backgroundColor = 'lightgray';
      constructed.innerText = cta;
      constructed.onclick = () => {
        // we should traverse the dom to find the closest textbox - 5 parents before we start querying - for now let's use specific textbox class
        // there is a div element with contenteditable true - class is msg-form__contenteditable
        // const textbox = document.querySelector(
        //   '.msg-form__contenteditable',
        // ) as HTMLDivElement;
        // const input = document.querySelector(
        //   '.msg-form input',
        // ) as HTMLInputElement;
        // if (textbox) {
        //   textbox.innerText = message;
        //   textbox.setAttribute('data-artdeco-is-focused', 'true');
        //   textbox.dispatchEvent(new Event('focus'));
        //   textbox.dispatchEvent(
        //     new KeyboardEvent('keypress', { key: message }),
        //   );
        //   input.value = message;
        //   input.dispatchEvent(new Event('change', { bubbles: true }));
        //   textbox.onchange(new Event('change', { bubbles: true })); // trigger change event
        //   textbox.dispatchEvent(new Event('blur'));
        // }
      };

      if (!container) {
        return;
      }

      container.appendChild(constructed);
    },
  });

  const { requestMethod } = useRequestProtocol();
  useQuery({
    queryKey,
    queryFn: () =>
      requestMethod(
        USER_REFERRAL_RECRUITER_QUERY,
        { toReferExternalId: id },
        { requestKey: JSON.stringify(queryKey) },
      ),
    enabled: !!id,
  });

  useEffect(() => {
    const func = async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // temporary: just to load the page

      const anchor = document.querySelector('.msg-thread__link-to-profile');

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute('href');
      setId(href.split('/in/')[1]);
    };

    func();
  }, []);
};
