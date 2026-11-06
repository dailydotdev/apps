import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import type { ApiErrorResult } from '../../../graphql/common';
import { Button } from '../../../components/buttons/Button';
import { ButtonVariant } from '../../../components/buttons/common';
import { TextField } from '../../../components/fields/TextField';
import Textarea from '../../../components/fields/Textarea';
import { Checkbox } from '../../../components/fields/Checkbox';
import {
  openTopicChatRoom,
  TOPIC_CHAT_ROOM_DESCRIPTION_MAX_LENGTH,
  TOPIC_CHAT_ROOM_TITLE_MAX_LENGTH,
} from '../graphql';
import { liveChatRoomsQueryOptions } from '../queries';
import { getChatRoomPath } from '../joinLink';

/**
 * The daily.dev team opens a chat on a topic: a title, a line on what it is
 * about, and the room is on for everyone, with a push on its way. Lands on
 * the room's page once it exists.
 */
export const TopicChatForm = (): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSilent, setIsSilent] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: openTopicChatRoom,
    onSuccess: (room) => {
      logEvent({
        event_name: LogEvent.StartLiveChat,
        target_type: TargetType.ChatRoom,
        target_id: room.id,
        extra: JSON.stringify({
          origin: Origin.NewLiveChat,
          silent: isSilent,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: liveChatRoomsQueryOptions(user).queryKey,
      });
      router.push(getChatRoomPath(room.id));
    },
    // The API says why (a title past the limit, not on the team); only a
    // failure with nothing to say reads as transient.
    onError: (error: ApiErrorResult) =>
      displayToast(
        error.response?.errors?.[0]?.message ||
          "Couldn't open the chat. Try again.",
      ),
  });
  const trimmedTitle = title.trim();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedTitle || isPending) {
      return;
    }
    mutate({
      title: trimmedTitle,
      description: description.trim() || undefined,
      silent: isSilent || undefined,
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <TextField
        inputId="topicChatTitle"
        name="title"
        label="What's the chat about?"
        placeholder="Is Bun ready for production?"
        value={title}
        valueChanged={setTitle}
        maxLength={TOPIC_CHAT_ROOM_TITLE_MAX_LENGTH}
        required
        autoFocus
      />
      <Textarea
        inputId="topicChatDescription"
        name="description"
        label="A line to set it up (optional)"
        placeholder="Bun 2.0 just shipped. Who is running it for real?"
        value={description}
        valueChanged={setDescription}
        maxLength={TOPIC_CHAT_ROOM_DESCRIPTION_MAX_LENGTH}
        rows={3}
      />
      <p className="text-text-tertiary typo-footnote">
        The chat is on for a few hours, then gone.{' '}
        {isSilent
          ? 'It shows on the feed, but nobody is pushed about it.'
          : 'Everyone around gets a push that it opened.'}
      </p>
      {/* A test run: the room is real and on the feed, just unannounced.
          Off by default so a real chat is never opened quietly by mistake. */}
      <Checkbox name="silent" checked={isSilent} onToggleCallback={setIsSilent}>
        Don&apos;t send a push (test run)
      </Checkbox>
      <Button
        type="submit"
        variant={ButtonVariant.Primary}
        className="self-end"
        loading={isPending}
        disabled={!trimmedTitle}
      >
        Open the chat
      </Button>
    </form>
  );
};
