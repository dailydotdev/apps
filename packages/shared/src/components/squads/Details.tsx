import React, { FormEvent, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { ClientError } from 'graphql-request';
import { useMutation } from 'react-query';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import UserIcon from '../icons/User';
import AtIcon from '../icons/At';
import Textarea from '../fields/Textarea';
import { SquadTitle, SquadTitleColor } from './utils';
import ImageInput from '../fields/ImageInput';
import { cloudinary } from '../../lib/image';
import CameraIcon from '../icons/Camera';
import { formToJson } from '../../lib/form';
import { Modal } from '../modals/common/Modal';
import { blobToBase64 } from '../../lib/blob';
import { checkExistingHandle, SquadForm } from '../../graphql/squads';
import { capitalize } from '../../lib/strings';
import { IconSize } from '../Icon';

const squadImageId = 'squad_image_file';

interface SquadDetailsProps {
  onSubmit: (e: FormEvent, formJson: SquadForm) => void;
  form: Partial<SquadForm>;
  createMode: boolean;
}

const getFormData = async (
  current: SquadForm,
  imageChanged: boolean,
): Promise<SquadForm> => {
  if (!imageChanged) return current;

  const input = document.getElementById(squadImageId) as HTMLInputElement;
  const file = input.files[0];
  const base64 = await blobToBase64(file);

  return { ...current, file: base64 };
};

export function SquadDetails({
  onSubmit,
  form,
  createMode = true,
}: SquadDetailsProps): ReactElement {
  const { name, handle, description } = form;
  const [imageChanged, setImageChanged] = useState(false);
  const [handleHint, setHandleHint] = useState<string>(null);
  const [canSubmit, setCanSubmit] = useState(!!name && !!handle);
  const { mutateAsync: onValidateHandle } = useMutation(checkExistingHandle, {
    onError: (err) => {
      const clientError = err as ClientError;
      const message = clientError?.response?.errors?.[0]?.message;
      if (!message) return null;

      const error = JSON.parse(message);
      if (error?.handle) return setHandleHint(capitalize(error?.handle));

      const [unknown] = Object.values(error);

      return setHandleHint(unknown as string);
    },
  });
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formJson = formToJson<SquadForm>(e.currentTarget);

    if (!formJson.name || !formJson.handle) {
      return null;
    }

    const data = await getFormData(formJson, imageChanged);

    if (!createMode) return onSubmit(e, data);

    const handleExists = await onValidateHandle(formJson.handle);
    setHandleHint(handleExists ? 'The handle already exists' : null);

    if (!handleExists) return onSubmit(e, data);

    return null;
  };
  const handleChange = (e: FormEvent<HTMLFormElement>) => {
    const formJson = formToJson<SquadForm>(e.currentTarget);
    setCanSubmit(!!formJson.handle && !!formJson.name);
  };

  return (
    <>
      <Modal.Body>
        <form
          className="flex flex-col gap-4 items-center -mb-2"
          onSubmit={handleSubmit}
          onChange={handleChange}
          id="squad-form"
        >
          {createMode && (
            <SquadTitle>
              Let&apos;s set up your <SquadTitleColor>Squad!</SquadTitleColor>
            </SquadTitle>
          )}
          <ImageInput
            initialValue={form.image ?? form.file}
            id={squadImageId}
            fallbackImage={cloudinary.squads.imageFallback}
            className={{
              container: '!rounded-full border-0 my-1',
              img: 'object-cover',
            }}
            hoverIcon={<CameraIcon size={IconSize.Large} />}
            alwayShowHover={!createMode && !imageChanged}
            onChange={() => setImageChanged(true)}
            size={createMode ? 'medium' : 'large'}
          />
          <TextField
            label="Squad name"
            inputId="name"
            name="name"
            valid={!!name}
            leftIcon={<UserIcon />}
            value={name ?? ''}
            className={{
              container: 'w-full',
            }}
          />
          <TextField
            label="Squad handle"
            inputId="handle"
            hint={handleHint}
            valid={!handleHint}
            name="handle"
            leftIcon={<AtIcon />}
            value={handle ?? ''}
            onChange={() => !!handleHint && setHandleHint(null)}
            className={{
              hint: 'text-theme-status-error',
              container: classNames('w-full', !handleHint && 'mb-5'),
            }}
          />
          <Textarea
            label="Squad description"
            inputId="description"
            name="description"
            hint="(optional)"
            rows={4}
            value={description ?? ''}
            maxLength={250}
            className={{
              hint: '-mt-8 py-2 pl-4',
              container: 'w-full',
            }}
          />
        </form>
      </Modal.Body>
      <Modal.Footer className={!createMode && 'px-6'}>
        <Button
          className={createMode ? 'btn-primary-cabbage' : 'btn-primary w-full'}
          form="squad-form"
          type="submit"
          disabled={!canSubmit}
        >
          {createMode ? 'Continue' : 'Save'}
        </Button>
      </Modal.Footer>
    </>
  );
}
