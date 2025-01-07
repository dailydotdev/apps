import type { KeyboardEvent, ReactElement } from 'react';
import React, { useCallback, useContext, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import Link from '../utilities/Link';
import { plusUrl } from '../../lib/constants';
import { LogEvent, TargetId } from '../../lib/log';
import { TextField } from '../fields/TextField';
import {
  BlockIcon,
  DevPlusIcon,
  FeedbackIcon,
  LockIcon,
  MiniCloseIcon,
} from '../icons';
import { GenericTagButton } from './TagButton';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { useBlockedQuery } from '../../hooks/contentPreference/useBlockedQuery';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { usePlusSubscription } from '../../hooks';
import { IconSize } from '../Icon';
import { FeedSettingsEditContext } from '../feeds/FeedSettings/FeedSettingsEditContext';

export const BlockedWords = (): ReactElement => {
  const feedSettingsEditContext = useContext(FeedSettingsEditContext);
  const feed = feedSettingsEditContext?.feed;
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { block, unblock } = useContentPreference();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const [words, setWords] = useState<string>();
  const invalidateBlockedWords = useCallback(() => {
    const queryKey = generateQueryKey(
      RequestKey.ContentPreference,
      user,
      RequestKey.UserBlocked,
      {
        entity: ContentPreferenceType.Word,
      },
    );
    queryClient.invalidateQueries({
      queryKey,
    });
  }, [queryClient, user]);
  const queryResult = useBlockedQuery({
    entity: ContentPreferenceType.Word,
    feedId: feed?.id,
  });
  const flatBlockedWords =
    queryResult?.data?.pages.flatMap(
      (page) => page.edges.flatMap((edge) => edge.node) || [],
    ) ?? [];
  const onKeyDown = async (event: KeyboardEvent): Promise<void> => {
    // Enter
    if (event.keyCode === 13 && words?.length) {
      await block({
        id: words,
        entity: ContentPreferenceType.Word,
        entityName: 'words',
        feedId: feed?.id,
      });
      invalidateBlockedWords();
      setWords('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Typography
        type={TypographyType.Body}
        tag={TypographyTag.H3}
        bold
        className="flex items-center gap-2"
      >
        Blocked words{' '}
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          className="flex gap-0.5 rounded-4 bg-action-plus-float p-0.5 pr-1"
          color={TypographyColor.Plus}
        >
          <DevPlusIcon size={IconSize.Size16} /> Plus
        </Typography>
      </Typography>
      <Typography
        color={TypographyColor.Tertiary}
        type={TypographyType.Callout}
      >
        Automatically filter out posts containing words you never want to see
        again. Life’s too short for unnecessary noise.
        {!isPlus ? (
          <>
            {' '}
            To unlock this feature{' '}
            <Link passHref href={plusUrl}>
              <Typography
                tag={TypographyTag.Link}
                color={TypographyColor.Plus}
                onClick={() => {
                  logSubscriptionEvent({
                    event_name: LogEvent.UpgradeSubscription,
                    target_id: TargetId.BlockedWords,
                  });
                }}
              >
                upgrade to Plus
              </Typography>
            </Link>
          </>
        ) : undefined}
      </Typography>
      <TextField
        inputId="blocked-words"
        label="Add blocked words"
        placeholder="Add blocked words"
        hint="Add commas (,) to block multiple words. Press Enter to submit them."
        hintIcon={<FeedbackIcon />}
        onKeyDown={onKeyDown}
        disabled={!isPlus}
        value={words}
        onChange={(event) => setWords(event.target.value)}
        rightIcon={!isPlus ? <LockIcon /> : undefined}
      />
      <div className="flex flex-wrap gap-2">
        {flatBlockedWords.map((word) => (
          <GenericTagButton
            showHashtag={false}
            key={word.referenceId}
            className="group btn-tagBlocked"
            icon={
              <>
                <BlockIcon className="ml-2 text-xl transition-transform group-hover:hidden" />
                <MiniCloseIcon className="ml-2 hidden text-xl transition-transform group-hover:inline" />
              </>
            }
            action={() =>
              unblock({
                id: word.referenceId,
                entity: ContentPreferenceType.Word,
                entityName: word.referenceId,
                feedId: feed?.id,
              }).then(() => invalidateBlockedWords())
            }
            tagItem={word.referenceId}
          />
        ))}
      </div>
    </div>
  );
};
