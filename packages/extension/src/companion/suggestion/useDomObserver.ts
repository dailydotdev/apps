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
      const parent = document.querySelector(`.${containerClass}`);
      const container = document.createElement('div');
      container.style =
        'display: flex; justify-content: center; margin-bottom: 8px;';
      const constructed = document.createElement('button');
      constructed.setAttribute(
        'class',
        'conversations-quick-replies__reply-button artdeco-button artdeco-button--2 artdeco-button--secondary',
      );
      constructed.style.marginLeft = 'auto';
      constructed.style.marginRight = 'auto';
      constructed.innerText = cta;
      constructed.onclick = () => {
        navigator.clipboard.writeText(message);
      };

      if (!parent) {
        return;
      }

      container.appendChild(constructed);
      parent.appendChild(container);
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
      await new Promise((resolve) => setTimeout(resolve, 3000)); // temporary: just to load the page

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
