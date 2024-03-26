import React, { FormEvent, ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import { ClientError } from 'graphql-request';
import { useMutation } from '@tanstack/react-query';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { AtIcon, CameraIcon, SquadIcon } from '../icons';
import Textarea from '../fields/Textarea';
import ImageInput from '../fields/ImageInput';
import { cloudinary } from '../../lib/image';
import { formToJson } from '../../lib/form';
import { blobToBase64 } from '../../lib/blob';
import { checkExistingHandle, SquadForm } from '../../graphql/squads';
import { anchorDefaultRel, capitalize } from '../../lib/strings';
import { IconSize } from '../Icon';
import { SourceMemberRole } from '../../graphql/sources';
import { Radio } from '../fields/Radio';
import { squadsPublicWaitlist } from '../../lib/constants';
import { ManageSquadPageFooter } from './utils';
import AuthContext from '../../contexts/AuthContext';

const squadImageId = 'squad_image_file';

interface SquadDetailsProps {
  className?: string;
  onSubmit?: (e: FormEvent, formJson: SquadForm) => void;
  form: Partial<SquadForm>;
  createMode: boolean;
  onRequestClose?: () => void;
}

const getFormData = async (
  current: SquadForm,
  imageChanged: boolean,
): Promise<SquadForm> => {
  if (!imageChanged) {
    return current;
  }

  const input = document.getElementById(squadImageId) as HTMLInputElement;
  const file = input.files[0];
  const base64 = await blobToBase64(file);

  return { ...current, file: base64 };
};

const memberRoleOptions = [
  {
    label: 'All members (recommended)',
    value: SourceMemberRole.Member,
  },
  {
    label: 'Only moderators',
    value: SourceMemberRole.Moderator,
  },
];

const squadTypeOptions = (userId: string) => [
  {
    label: 'Private Squad',
    value: 'private',
    afterElement: (
      <p className="mb-5 ml-10 typo-footnote">
        Only people who join the squad can see the content
      </p>
    ),
  },
  {
    label: 'Public Squad (beta)',
    value: 'public',
    disabled: true,
    afterElement: (
      <p className="mb-2 ml-10 text-theme-label-tertiary typo-footnote">
        Everyone can see the content, and the posts may appear on the main
        feed.&nbsp;
        <a
          href={`${squadsPublicWaitlist}#user_id=${userId}`}
          rel={anchorDefaultRel}
          target="_blank"
          className="text-theme-label-link underline"
        >
          Join waitlist
        </a>
      </p>
    ),
  },
];

export function SquadDetails({
  className,
  onSubmit,
  form,
  createMode = true,
  onRequestClose,
}: SquadDetailsProps): ReactElement {
  const { user } = useContext(AuthContext);
  const {
    name,
    handle,
    description,
    memberPostingRole: initialMemberPostingRole,
    memberInviteRole: initialMemberInviteRole,
  } = form;
  const [activeHandle, setActiveHandle] = useState(handle);
  const [imageChanged, setImageChanged] = useState(false);
  const [handleHint, setHandleHint] = useState<string>(null);
  const [canSubmit, setCanSubmit] = useState(!!name && !!activeHandle);
  const [isDescriptionOpen, setDescriptionOpen] = useState(!createMode);
  const [memberPostingRole, setMemberPostingRole] = useState(
    () => initialMemberPostingRole || SourceMemberRole.Member,
  );
  const [memberInviteRole, setMemberInviteRole] = useState(
    () => initialMemberInviteRole || SourceMemberRole.Member,
  );
  const { mutateAsync: onValidateHandle } = useMutation(checkExistingHandle, {
    onError: (err) => {
      const clientError = err as ClientError;
      const message = clientError?.response?.errors?.[0]?.message;
      if (!message) {
        return null;
      }

      const error = JSON.parse(message);
      if (error?.handle) {
        return setHandleHint(capitalize(error?.handle));
      }

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

    if (!createMode) {
      return onSubmit(e, data);
    }

    const handleExists = await onValidateHandle(formJson.handle);
    setHandleHint(handleExists ? 'The handle already exists' : null);

    if (!handleExists) {
      return onSubmit(e, data);
    }

    return null;
  };
  const handleChange = (e: FormEvent<HTMLFormElement>) => {
    const formJson = formToJson<SquadForm>(e.currentTarget);

    // Auto-populate the handle if name is provided and handle empty
    if (formJson.name && !activeHandle && !formJson.handle) {
      setActiveHandle(formJson.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));
    }

    setCanSubmit(!!formJson.name);
  };

  return (
    <>
      <div className={classNames('flex flex-col', className)}>
        <form
          className="-mb-2 flex flex-col items-center gap-4"
          onSubmit={handleSubmit}
          onBlur={handleChange}
          id="squad-form"
        >
          {!createMode && (
            <ImageInput
              initialValue={form.image ?? form.file}
              id={squadImageId}
              fallbackImage={cloudinary.squads.imageFallback}
              className={{
                container: 'my-1 !rounded-full border-0',
                img: 'object-cover',
              }}
              hoverIcon={<CameraIcon size={IconSize.Large} />}
              alwaysShowHover={!imageChanged}
              onChange={() => setImageChanged(true)}
              size="large"
            />
          )}
          <div className="flex w-full max-w-lg flex-col justify-center gap-4">
            <TextField
              label={createMode ? 'Name your Squad' : 'Squad name'}
              inputId="name"
              name="name"
              valid={!!name}
              leftIcon={<SquadIcon />}
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
              value={activeHandle ?? ''}
              onChange={() => !!handleHint && setHandleHint(null)}
              className={{
                hint: 'text-status-error',
                container: classNames('w-full', !handleHint && 'mb-1'),
              }}
            />
            {!isDescriptionOpen && (
              <button
                className="mr-auto text-theme-label-tertiary typo-callout"
                type="button"
                onClick={() => {
                  setDescriptionOpen((current) => !current);
                }}
              >
                + Add description
              </button>
            )}
            {isDescriptionOpen && (
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
            )}
            <h4 className="mt-2 font-bold typo-body">
              {createMode ? 'Squad type' : 'Squad'}
            </h4>
            <div>
              <Radio
                name="squadType"
                options={squadTypeOptions(user.id)}
                value="private"
                onChange={() => {}}
              />
            </div>
            <div className="mt-2 flex flex-col gap-4 tablet:flex-row">
              <div className="flex flex-1 flex-col">
                <h4 className="mb-2 font-bold typo-body">Post permissions</h4>
                <p className="mb-4 text-theme-label-tertiary typo-callout">
                  Choose who is allowed to post new content in this Squad.
                </p>
                <Radio
                  name="memberPostingRole"
                  options={memberRoleOptions}
                  value={memberPostingRole}
                  onChange={(value) =>
                    setMemberPostingRole(value as SourceMemberRole)
                  }
                />
              </div>
              <div className="flex flex-1 flex-col">
                <h4 className="mb-2 font-bold typo-body">
                  Invitation permissions
                </h4>
                <p className="mb-4 text-theme-label-tertiary typo-callout">
                  Choose who is allowed to invite new members to this Squad.
                </p>
                <Radio
                  name="memberInviteRole"
                  options={memberRoleOptions}
                  value={memberInviteRole}
                  onChange={(value) =>
                    setMemberInviteRole(value as SourceMemberRole)
                  }
                />
              </div>
            </div>
          </div>
        </form>
      </div>
      <ManageSquadPageFooter
        className={classNames(!createMode && 'px-6', 'mt-auto justify-between')}
      >
        {createMode && (
          <Button onClick={onRequestClose} variant={ButtonVariant.Tertiary}>
            Close
          </Button>
        )}
        <Button
          variant={ButtonVariant.Primary}
          color={createMode ? ButtonColor.Cabbage : undefined}
          className={!createMode && 'w-full'}
          form="squad-form"
          type="submit"
          disabled={!canSubmit}
        >
          {createMode ? 'Create Squad' : 'Save'}
        </Button>
      </ManageSquadPageFooter>
    </>
  );
}
