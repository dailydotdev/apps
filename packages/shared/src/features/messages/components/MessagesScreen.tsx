import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
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
import { settingsUrl } from '../../../lib/constants';
import { useAgentShellHeight } from '../../interests/shell';
import { useMessagesLiveUpdates } from '../hooks/useMessagesLiveUpdates';
import { useDmSettings } from '../hooks/useDmSettings';
import { ConversationList } from './ConversationList';
import { ConversationThread } from './ConversationThread';
import { NewMessageSearch } from './NewMessageSearch';

const privacySettingsUrl = `${settingsUrl}/privacy`;

// Two panes on laptop; below it the list and the thread are separate screens,
// picked by whether a conversation is open.
export const MessagesScreen = ({
  activePeerId,
  commentId,
  onCommentContextUsed,
}: {
  activePeerId?: string;
  commentId?: string;
  onCommentContextUsed?: () => void;
}): ReactElement => {
  // A conversation has no bottom bar on phones: its composer takes the place.
  const shellHeight = useAgentShellHeight(false, !activePeerId);
  const { allowsMessages } = useDmSettings();
  const [isComposing, setIsComposing] = useState(false);
  useMessagesLiveUpdates(true);

  return (
    <div className={classNames('flex w-full min-w-0', shellHeight)}>
      {!activePeerId && (
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
              <Link href={privacySettingsUrl} passHref>
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
          activePeerId ? 'hidden laptop:flex' : 'flex',
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
            <Link href={privacySettingsUrl} passHref>
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
              <Link href={privacySettingsUrl} passHref>
                <a className="text-text-link hover:underline">Turn on</a>
              </Link>
            </Typography>
          </div>
        )}
        {isComposing ? (
          <NewMessageSearch onClose={() => setIsComposing(false)} />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            <ConversationList
              activePeerId={activePeerId}
              onNewMessage={() => setIsComposing(true)}
            />
          </div>
        )}
      </FlexCol>
      <FlexCol
        className={classNames(
          'min-w-0 flex-1',
          activePeerId ? 'flex' : 'hidden laptop:flex',
        )}
      >
        {activePeerId ? (
          <ConversationThread
            key={activePeerId}
            peerId={activePeerId}
            commentId={commentId}
            onCommentContextUsed={onCommentContextUsed}
          />
        ) : (
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
