import React, { FormEvent, ReactElement, useState } from 'react';
import classNames from 'classnames';
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
import { checkSourceExists, SquadForm } from '../../graphql/squads';

const squadImageId = 'squad_image_file';
export function SquadDetails({
  onSubmit,
  form,
  createMode = true,
}: {
  onSubmit: (e, formJson) => void;
  form: Partial<SquadForm>;
  createMode: boolean;
}): ReactElement {
  const { name, handle, description } = form;
  const [handleValid, setHandleValid] = useState(true);
  const [canSubmit, setCanSubmit] = useState(!!name && !!handle);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formJson = formToJson<SquadForm>(e.currentTarget);
    if (!formJson.name || !formJson.handle) {
      return;
    }
    const handleExists = await checkSourceExists(formJson.handle);
    setHandleValid(!handleExists);
    if (!handleExists) {
      onSubmit(e, formJson);
    }
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
            initialValue={form.file}
            id={squadImageId}
            fallbackImage={cloudinary.squads.imageFallback}
            className={{
              container: '!rounded-full border-0 my-1',
              img: 'object-cover',
            }}
            hoverIcon={<CameraIcon size="xlarge" />}
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
            hint={!handleValid ? 'The handle is already exists' : undefined}
            valid={handleValid}
            name="handle"
            leftIcon={<AtIcon />}
            value={handle ?? ''}
            className={{
              hint: 'text-theme-status-error',
              container: classNames('w-full', handleValid && 'mb-5'),
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
