import React, {
  FormEvent,
  ReactElement,
  useState,
} from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import UserIcon from '../icons/User';
import AtIcon from '../icons/At';
import Textarea from '../fields/Textarea';
import {
  checkSourceExists,
  ModalState,
  SquadForm,
  SquadStateProps,
  SquadTitle,
  SquadTitleColor,
} from './utils';
import ImageInput from '../fields/ImageInput';
import { cloudinary } from '../../lib/image';
import CameraIcon from '../icons/Camera';
import { formToJson } from '../../lib/form';
import { Modal } from '../modals/common/Modal';

const squadImageId = 'squad_image_file';
export function SquadDetails({
  modalState,
  onNext,
  form,
  setForm,
}: SquadStateProps): ReactElement {
  if (ModalState.Details !== modalState) return null;
  const { name, handle, description } = form;
  const [handleValid, setHandleValid] = useState(true);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formJson = formToJson<SquadForm>(e.currentTarget);
    if (!formJson.name || !formJson.handle) {
      return;
    }
    const handleExists = await checkSourceExists(formJson.handle);
    setHandleValid(!handleExists);
    if (!handleExists) {
      onNext(formJson);
    }
  };
  return (
    <>
      <Modal.Body>
        <form
          className="flex flex-col gap-4 items-center"
          onSubmit={onSubmit}
          id="squad-form"
        >
          <SquadTitle>
            Make it look <SquadTitleColor>yours.</SquadTitleColor>
          </SquadTitle>
          <ImageInput
            initialValue={form.file}
            id={squadImageId}
            fallbackImage={cloudinary.squads.imageFallback}
            className={{
              container: 'rounded-full border-0 my-1',
              img: 'object-cover',
            }}
            hoverIcon={<CameraIcon size="xlarge" />}
            onChange={(file) => setForm({ file })}
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
            valueChanged={(text) => setForm({ ...form, name: text })}
          />
          <TextField
            label="Handle"
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
            valueChanged={(text) => setForm({ ...form, handle: text })}
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
      <Modal.Footer>
        <Button
          className="btn-primary-cabbage"
          form="squad-form"
          type="submit"
          disabled={!name || !handle}
        >
          Continue
        </Button>
      </Modal.Footer>
    </>
  );
}
