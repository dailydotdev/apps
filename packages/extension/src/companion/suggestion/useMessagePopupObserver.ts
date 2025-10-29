import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { USER_REFERRAL_RECRUITER_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { useBackgroundRequest } from '@dailydotdev/shared/src/hooks/companion';
import { useRequestProtocol } from '@dailydotdev/shared/src/hooks/useRequestProtocol';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useQuery } from '@tanstack/react-query';
import { useGrowthBookContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { inviteRecruiterFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import { generateReplySuggestion } from './common';

interface UseMessagePopupObserverProps {
  id: string;
  container: HTMLElement | Document;
}

const quickRepliesClass = 'msg-s-message-list__quick-replies-container';
const input = '.msg-form__contenteditable';

export const useMessagePopupObserver = ({
  id,
  container,
}: UseMessagePopupObserverProps) => {
  const { growthbook } = useGrowthBookContext();
  const { user } = useAuthContext();
  const queryKey = generateQueryKey(RequestKey.InviteRecruiter, user, id);

  useBackgroundRequest(queryKey, {
    enabled: !!id,
    callback: async ({ res }) => {
      const { url } = res.userReferralRecruiter;

      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for the dom to load

      const quickReplies = container.querySelector(`.${quickRepliesClass}`);

      if (!quickReplies) {
        return;
      }

      const { cta, message } = growthbook.getFeatureValue(
        inviteRecruiterFeature.id,
        inviteRecruiterFeature.defaultValue,
      );
      const formattedMessage = message.replace('{{url}}', url);

      generateReplySuggestion({
        cta,
        wrapper: container,
        onClick: () => {
          const replyBox = container.querySelector(input) as HTMLElement;
          const p = document.createElement('p');
          p.innerText = formattedMessage;

          replyBox.innerText = '';
          replyBox.appendChild(p);

          const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: formattedMessage,
          });

          replyBox.dispatchEvent(inputEvent);
          replyBox.focus();
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
