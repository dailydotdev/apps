import type { ReactElement } from 'react';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../modals/common/Modal';
import { Radio } from '../fields/Radio';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import ControlledTextField from '../fields/ControlledTextField';
import { TextField } from '../fields/TextField';
import { type LiveRoomJoinToken, LiveRoomMode } from '../../graphql/liveRooms';
import { useCreateLiveRoom } from '../../hooks/liveRooms/useCreateLiveRoom';
import { useToastNotification } from '../../hooks/useToastNotification';
import { labels } from '../../lib/labels';

const DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT = 4;

const speakerLimitFieldSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  return Number(value);
}, z.number().int().positive('Speaker limit must be at least 1').optional());

const createLiveRoomFormSchema = z
  .object({
    topic: z
      .string()
      .trim()
      .min(1, 'Topic is required')
      .max(280, 'Topic must be 280 characters or less'),
    mode: z.nativeEnum(LiveRoomMode),
    speakerLimit: speakerLimitFieldSchema,
  })
  .superRefine((values, ctx) => {
    if (
      values.mode === LiveRoomMode.FreeForAll &&
      values.speakerLimit === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['speakerLimit'],
        message: 'Speaker limit is required for free-for-all rooms',
      });
    }
  });

type CreateLiveRoomFormValues = z.infer<typeof createLiveRoomFormSchema>;

const CREATE_LIVE_ROOM_FORM_ID = 'create-live-room-form';

interface CreateLiveRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (joinToken: LiveRoomJoinToken) => void;
}

export const CreateLiveRoomModal = ({
  isOpen,
  onClose,
  onCreated,
}: CreateLiveRoomModalProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { mutateAsync: createLiveRoom, isPending } = useCreateLiveRoom();

  const form = useForm<CreateLiveRoomFormValues>({
    resolver: zodResolver(createLiveRoomFormSchema),
    defaultValues: {
      topic: '',
      mode: LiveRoomMode.Moderated,
      speakerLimit: DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT,
    },
  });
  const selectedMode = form.watch('mode');

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const joinToken = await createLiveRoom({
        topic: values.topic,
        mode: values.mode,
        speakerLimit:
          values.mode === LiveRoomMode.FreeForAll
            ? values.speakerLimit
            : undefined,
      });
      onCreated(joinToken);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : labels.error.generic;
      displayToast(message);
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onClose}
    >
      <Modal.Header title="Start a live room" />
      <Modal.Body className="flex flex-col gap-4">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Pick a topic, choose how the stage works, and we&apos;ll spin up the
          room right away.
        </Typography>
        <FormProvider {...form}>
          <form
            id={CREATE_LIVE_ROOM_FORM_ID}
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
          >
            <ControlledTextField
              name="topic"
              label="Topic"
              placeholder="What do you want to talk about?"
            />
            <div className="flex flex-col gap-3">
              <Typography type={TypographyType.Footnote} bold>
                Room mode
              </Typography>
              <Radio
                name="mode"
                value={form.watch('mode')}
                onChange={(value) => {
                  form.setValue('mode', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  if (
                    value === LiveRoomMode.FreeForAll &&
                    form.getValues('speakerLimit') === undefined
                  ) {
                    form.setValue(
                      'speakerLimit',
                      DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT,
                      {
                        shouldDirty: true,
                      },
                    );
                  }
                }}
                options={[
                  {
                    value: LiveRoomMode.Moderated,
                    label: 'Moderated',
                    afterElement: (
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                        className="pl-10"
                      >
                        People join a queue and the host brings them on stage.
                      </Typography>
                    ),
                  },
                  {
                    value: LiveRoomMode.FreeForAll,
                    label: 'Free for all',
                    afterElement: (
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                        className="pl-10"
                      >
                        Anyone can hop on stage until the speaker limit you set
                        is full.
                      </Typography>
                    ),
                  },
                ]}
              />
            </div>
            {selectedMode === LiveRoomMode.FreeForAll ? (
              <Controller
                control={form.control}
                name="speakerLimit"
                render={({ field, fieldState }) => (
                  <TextField
                    inputId={field.name}
                    name={field.name}
                    label="Speaker limit"
                    type="number"
                    min={1}
                    placeholder={String(DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT)}
                    fieldType="secondary"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    valid={!fieldState.error}
                    hint={
                      fieldState.error?.message ??
                      'How many audience members can be on stage at once.'
                    }
                  />
                )}
              />
            ) : null}
          </form>
        </FormProvider>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          form={CREATE_LIVE_ROOM_FORM_ID}
          type="submit"
          variant={ButtonVariant.Primary}
          loading={isPending}
        >
          Start room
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateLiveRoomModal;
