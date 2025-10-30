import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { inviteRecruiterFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks';
import { useRequestProtocol } from '@dailydotdev/shared/src/hooks/useRequestProtocol';
import user from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { USER_REFERRAL_RECRUITER_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { useMutation } from '@tanstack/react-query';
import { useBackgroundRequest } from '@dailydotdev/shared/src/hooks/companion';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import type { TargetId } from '@dailydotdev/shared/src/lib/log';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import { useGenerateSuggestionContainer } from './useGenerateSuggestionContainer';

interface MessageSuggestionPortalProps {
  bubble: HTMLElement | Document;
  id: string;
  target_id: TargetId.ThreadPage | TargetId.MessagePopup;
}

const input = '.msg-form__contenteditable';

export function MessageSuggestionPortal({
  bubble,
  id,
  target_id,
}: MessageSuggestionPortalProps) {
  const { logEvent } = useLogContext();
  const { injectedElement } = useGenerateSuggestionContainer({
    id,
    container: bubble,
  });
  const { value, isLoading } = useConditionalFeature({
    feature: inviteRecruiterFeature,
    shouldEvaluate: !!injectedElement,
  });
  const { cta, message } = value;

  const mutationKey = generateQueryKey(RequestKey.InviteRecruiter, user, id);
  const { requestMethod } = useRequestProtocol();
  const { mutateAsync } = useMutation({
    mutationFn: () =>
      requestMethod(
        USER_REFERRAL_RECRUITER_QUERY,
        { toReferExternalId: id },
        { requestKey: JSON.stringify(mutationKey) },
      ),
  });

  useBackgroundRequest(mutationKey, {
    callback: async ({ res }) => {
      const url = res?.userReferralRecruiter?.url;

      if (!url) {
        return;
      }

      const formattedMessage = message.replace('{{url}}', url);
      const replyBox = bubble.querySelector(input) as HTMLElement;
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

  const shouldShow = !!injectedElement && !isLoading && !!id;
  const isLoggedRef = React.useRef(false);

  useEffect(() => {
    if (shouldShow && !isLoggedRef.current) {
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.InviteRecruiter,
        target_id,
      });
      isLoggedRef.current = true;
    }
  }, [logEvent, target_id, shouldShow]);

  if (!injectedElement || isLoading || !id) {
    return null;
  }

  const handleClick = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.InviteRecruiter,
      target_id,
    });
    mutateAsync();
  };

  return createPortal(
    <button
      type="button"
      className="artdeco-button artdeco-button--2 artdeco-button--primary"
      style={{ fontSize: '14px' }}
      onClick={handleClick}
    >
      <CoreIcon style={{ width: '20px', height: '20px', marginRight: '4px' }} />
      {cta}
    </button>,
    injectedElement,
  );
}
