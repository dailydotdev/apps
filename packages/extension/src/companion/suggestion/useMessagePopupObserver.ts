import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { USER_REFERRAL_RECRUITER_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import { useBackgroundRequest } from '@dailydotdev/shared/src/hooks/companion';
import { useRequestProtocol } from '@dailydotdev/shared/src/hooks/useRequestProtocol';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useQuery } from '@tanstack/react-query';
import { generateReplySuggestion } from './common';

interface UseMessagePopupObserverProps {
  id: string;
  container: HTMLElement;
}

const quickRepliesClass = 'msg-s-message-list__quick-replies-container';

export const useMessagePopupObserver = ({
  id,
  container,
}: UseMessagePopupObserverProps) => {
  const { user } = useAuthContext();
  const queryKey = generateQueryKey(RequestKey.InviteRecruiter, user, id);
  const { displayToast } = useToastNotification();

  useBackgroundRequest(queryKey, {
    enabled: !!id,
    callback: async ({ res }) => {
      const { cta, message } = res.userReferralRecruiter;

      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for the dom to load

      const quickReplies = container.querySelector(`.${quickRepliesClass}`);

      if (!quickReplies) {
        return;
      }

      generateReplySuggestion({
        cta,
        wrapper: container,
        onClick: () => {
          navigator.clipboard.writeText(message);
          displayToast('Referral message copied to clipboard!');
        },
      });
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
};
