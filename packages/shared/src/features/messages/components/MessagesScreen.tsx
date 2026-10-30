import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { FlexCol } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { SettingsIcon } from '../../../components/icons/Settings';
import { PlusIcon } from '../../../components/icons/Plus';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { IconSize } from '../../../components/Icon';
import { ShellPage } from '../../../components/shell/ShellPageContext';
import { ShellSquare } from '../../../components/shell/ShellSquare';
import { useAgentShellHeight } from '../../interests/shell';
import { useIsPhone, useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { useKeyboardFit } from '../../../hooks/utils/useKeyboardFit';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useMessagesLiveUpdates } from '../hooks/useMessagesLiveUpdates';
import { dmRequestCountQueryOptions } from '../queries';
import { getMessagesUrl, messageSettingsUrl } from '../urls';
import type { DmOrigin } from '../urls';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { LogEvent } from '../../../lib/log';
import { RequestList } from './RequestList';
import { useDmSettings } from '../hooks/useDmSettings';
import { ConversationList } from './ConversationList';
import { ConversationThread } from './ConversationThread';
import { NewMessageSearch } from './NewMessageSearch';
import { useLfgRequestCount } from '../../lfg/components/messages/LfgRequestSection';
import { LfgReachOutDetail } from '../../lfg/components/messages/LfgReachOutDetail';
import { LfgMessagesPromo } from '../../lfg/components/messages/LfgMessagesPromo';
import { LfgMessagesTab } from '../../lfg/components/messages/LfgMessagesTab';
import { useLfgEnabled } from '../../lfg/hooks/useLfgEnabled';

// Two panes on laptop; below it the list and the thread are separate screens,
// picked by whether a conversation is open.
export const MessagesScreen = ({
  activePeerId,
  activeReachOutId,
  commentId,
  origin,
  showRequests = false,
  showLfg = false,
  onCommentContextUsed,
}: {
  activePeerId?: string;
  // A Looking for group reach-out, open in the Requests tab.
  activeReachOutId?: string;
  commentId?: string;
  origin?: DmOrigin;
  showRequests?: boolean;
  // Phones and tablets only: from laptop up the rail's Messages panel holds it.
  showLfg?: boolean;
  onCommentContextUsed?: () => void;
}): ReactElement => {
  const { user } = useAuthContext();
  const { data: dmRequestCount = 0 } = useQuery(
    dmRequestCountQueryOptions(user),
  );
  const lfgRequestCount = useLfgRequestCount();
  const { isEnabled: isLfgEnabled } = useLfgEnabled();
  const requestCount = dmRequestCount + lfgRequestCount;
  const isLaptop = useViewSize(ViewSize.Laptop);
  const requestedTab =
    (showRequests && 'requests') || (showLfg && !isLaptop && 'lfg') || 'chats';
  const tab = requestedTab === 'lfg' && !isLfgEnabled ? 'chats' : requestedTab;
  const isLfgTab = tab === 'lfg';
  const isChatsTab = tab === 'chats';
  const reachOutId =
    showRequests && isLfgEnabled ? activeReachOutId : undefined;
  const hasDetail = !!activePeerId || !!reachOutId;
  // A conversation has no bottom bar on phones: its composer takes the place.
  const shellHeight = useAgentShellHeight(false, !hasDetail);
  const screenRef = useRef<HTMLDivElement>(null);
  const keyboardHeight = useKeyboardFit(screenRef, useIsPhone());
  const { allowsMessages } = useDmSettings();
  const [isComposing, setIsComposing] = useState(false);
  useMessagesLiveUpdates(true);
  useLogEventOnce(() => ({
    event_name: LogEvent.OpenMessages,
    extra: JSON.stringify({
      origin: origin ?? null,
      tab: requestedTab,
      has_conversation: !!activePeerId,
    }),
  }));

  return (
    <div
      ref={screenRef}
      className={classNames('flex w-full min-w-0', shellHeight)}
      style={keyboardHeight ? { height: keyboardHeight } : undefined}
    >
      {!hasDetail && (
        <ShellPage
          title="Messages"
          actions={
            <>
              <ShellSquare
                aria-label="New message"
                aria-pressed={isComposing}
                onClick={() => setIsComposing((value) => !value)}
              >
                <PlusIcon size={IconSize.Small} />
              </ShellSquare>
              <Link href={messageSettingsUrl} passHref>
                <ShellSquare tag="a" aria-label="Message settings">
                  <SettingsIcon size={IconSize.Small} />
                </ShellSquare>
              </Link>
            </>
          }
        />
      )}
      <FlexCol
        className={classNames(
          'w-full min-w-0 shrink-0 laptop:w-80 laptop:border-r laptop:border-border-subtlest-tertiary',
          hasDetail ? 'hidden laptop:flex' : 'flex',
        )}
      >
        <header className="hidden h-14 shrink-0 items-center justify-between px-4 tablet:flex">
          <Typography tag={TypographyTag.H1} type={TypographyType.Title3} bold>
            Messages
          </Typography>
          <div className="flex items-center gap-1">
            <Tooltip content="New message">
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<PlusIcon />}
                aria-label="New message"
                aria-pressed={isComposing}
                onClick={() => setIsComposing((value) => !value)}
              />
            </Tooltip>
            <Link href={messageSettingsUrl} passHref>
              <Button
                tag="a"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<SettingsIcon />}
                aria-label="Message settings"
              />
            </Link>
          </div>
        </header>
        {!allowsMessages && (
          <div className="mx-4 mb-3 rounded-12 bg-surface-float px-3 py-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Direct messages are off, so nobody can message you.{' '}
              <Link href={messageSettingsUrl} passHref>
                <a className="text-text-link hover:underline">Turn on</a>
              </Link>
            </Typography>
          </div>
        )}
        {isComposing ? (
          <NewMessageSearch onClose={() => setIsComposing(false)} />
        ) : (
          <>
            <nav aria-label="Inbox" className="flex shrink-0 gap-1 px-4 pb-2">
              <Link href={getMessagesUrl()} passHref>
                <Button
                  tag="a"
                  variant={
                    isChatsTab ? ButtonVariant.Float : ButtonVariant.Tertiary
                  }
                  size={ButtonSize.Small}
                  aria-current={isChatsTab ? 'page' : undefined}
                >
                  Chats
                </Button>
              </Link>
              <Link
                href={getMessagesUrl(undefined, { requests: true })}
                passHref
              >
                <Button
                  tag="a"
                  variant={
                    showRequests ? ButtonVariant.Float : ButtonVariant.Tertiary
                  }
                  size={ButtonSize.Small}
                  aria-current={showRequests ? 'page' : undefined}
                >
                  Requests{requestCount > 0 && ` (${requestCount})`}
                </Button>
              </Link>
              {isLfgEnabled && (
                <Link href={getMessagesUrl(undefined, { lfg: true })} passHref>
                  <Button
                    tag="a"
                    variant={
                      isLfgTab ? ButtonVariant.Float : ButtonVariant.Tertiary
                    }
                    size={ButtonSize.Small}
                    className="laptop:hidden"
                    aria-current={isLfgTab ? 'page' : undefined}
                  >
                    LFG
                  </Button>
                </Link>
              )}
            </nav>
            <div className="min-h-0 flex-1 overflow-y-auto pb-4">
              {showRequests && (
                <RequestList
                  activePeerId={activePeerId}
                  activeReachOutId={reachOutId}
                />
              )}
              {isLfgTab && <LfgMessagesTab />}
              {isChatsTab && (
                <>
                  {allowsMessages && <LfgMessagesPromo />}
                  <ConversationList
                    activePeerId={activePeerId}
                    onNewMessage={() => setIsComposing(true)}
                  />
                </>
              )}
            </div>
          </>
        )}
      </FlexCol>
      <FlexCol
        className={classNames(
          'min-w-0 flex-1',
          hasDetail ? 'flex' : 'hidden laptop:flex',
        )}
      >
        {reachOutId && !activePeerId && (
          <LfgReachOutDetail key={reachOutId} reachOutId={reachOutId} />
        )}
        {!reachOutId && activePeerId && (
          <ConversationThread
            key={activePeerId}
            peerId={activePeerId}
            commentId={commentId}
            origin={origin}
            onCommentContextUsed={onCommentContextUsed}
          />
        )}
        {!hasDetail && (
          <FlexCol className="flex-1 items-center justify-center px-6 text-center">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Pick a conversation to start chatting.
            </Typography>
          </FlexCol>
        )}
      </FlexCol>
    </div>
  );
};
