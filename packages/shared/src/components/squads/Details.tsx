import React, { FormEvent, ReactElement, ReactNode, useState } from 'react';
import classNames from 'classnames';
import { ClientError } from 'graphql-request';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { ButtonColor, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { ArrowIcon, AtIcon, CameraIcon, SquadIcon } from '../icons';
import Textarea from '../fields/Textarea';
import ImageInput from '../fields/ImageInput';
import { cloudinary } from '../../lib/image';
import { formToJson } from '../../lib/form';
import { blobToBase64 } from '../../lib/blob';
import { checkExistingHandle, SquadForm } from '../../graphql/squads';
import { capitalize } from '../../lib/strings';
import { IconSize } from '../Icon';
import { SourceMemberRole } from '../../graphql/sources';
import { Radio } from '../fields/Radio';
import { FormWrapper } from '../fields/form';
import { SquadSettingsSection, SquadStatus } from './settings';
import {
  PrivacyOption,
  useSquadPrivacyOptions,
} from '../../hooks/squads/useSquadPrivacyOptions';
import Alert, { AlertType } from '../widgets/Alert';
import { Anchor } from '../text';
import { usePublicSquadRequests } from '../../hooks';
import { PUBLIC_SQUAD_REQUEST_REQUIREMENT } from '../../lib/config';

const squadImageId = 'squad_image_file';

interface SquadDetailsProps {
  onSubmit?: (e: FormEvent, formJson: SquadForm) => void;
  form: Partial<SquadForm>;
  createMode: boolean;
  onRequestClose?: () => void;
  children?: ReactNode;
  isLoading?: boolean;
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

export function SquadDetails({
  onSubmit,
  form,
  createMode = true,
  children,
  isLoading,
}: SquadDetailsProps): ReactElement {
  const {
    name,
    handle,
    description,
    memberPostingRole: initialMemberPostingRole,
    memberInviteRole: initialMemberInviteRole,
  } = form;
  const isRequestsEnabled =
    !createMode &&
    (form.flags?.totalPosts ?? 0) >= PUBLIC_SQUAD_REQUEST_REQUIREMENT &&
    !!form?.id;
  const { status, daysLeft } = usePublicSquadRequests({
    isQueryEnabled: isRequestsEnabled,
    sourceId: form?.id,
    isPublic: form?.public,
  });
  const [activeHandle, setActiveHandle] = useState(handle);
  const [privacy, setPrivacy] = useState(
    form.public ? PrivacyOption.Public : PrivacyOption.Private,
  );
  const [imageChanged, setImageChanged] = useState(false);
  const [handleHint, setHandleHint] = useState<string>(null);
  const [canSubmit, setCanSubmit] = useState(!!name && !!activeHandle);
  const [isDescriptionOpen, setDescriptionOpen] = useState(!createMode);
  const privacyOptions = useSquadPrivacyOptions({
    totalPosts: form?.flags?.totalPosts,
    status,
    squadId: form?.id,
  });
  const router = useRouter();
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
    <FormWrapper
      form="squad-form"
      isHeaderTitle
      title={createMode ? undefined : 'Squad settings'}
      className={{ container: 'flex flex-1 flex-col', title: 'typo-title3' }}
      copy={{ right: createMode ? 'Create Squad' : 'Save', left: null }}
      leftButtonProps={{
        icon: <ArrowIcon className="-rotate-90" />,
        onClick: () =>
          router.push(createMode ? '/squads' : `/squads/${handle}`),
      }}
      rightButtonProps={{
        disabled: !canSubmit || isLoading,
        variant: ButtonVariant.Primary,
        color: createMode ? ButtonColor.Cabbage : undefined,
        loading: isLoading,
      }}
    >
      {children}
      <form
        className="flex w-full flex-col items-center justify-center gap-4 p-6 pt-0"
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
              container: 'mt-4 !rounded-full border-0',
              img: 'object-cover',
            }}
            hoverIcon={<CameraIcon size={IconSize.Large} />}
            alwaysShowHover={!imageChanged}
            onChange={() => setImageChanged(true)}
            size="large"
          />
        )}
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
            className="mr-auto text-text-tertiary typo-callout"
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
        {!createMode && (
          <SquadSettingsSection title="Status" className="w-full">
            <Radio
              name="status"
              options={privacyOptions}
              value={privacy}
              className={{ container: 'gap-4' }}
              onChange={(value) => setPrivacy(value)}
            />
            {status === SquadStatus.Rejected && (
              <Alert
                type={AlertType.Error}
                flexDirection="flex-row"
                className="mt-2"
              >
                <p className="flex-1">
                  You did not pass the review process. You can try again
                  in&nbsp;{daysLeft}
                  &nbsp;days. To increase your chances to pass in the next round
                  you can contact us at{' '}
                  <Anchor href="mailto:support@daily.dev">
                    support@daily.dev
                  </Anchor>
                  .
                </p>
              </Alert>
            )}
          </SquadSettingsSection>
        )}
        <div className="mt-2 flex flex-col gap-4 tablet:flex-row">
          <SquadSettingsSection
            title="Post permissions"
            description="Choose who is allowed to post new content in this Squad."
          >
            <Radio
              name="memberPostingRole"
              options={memberRoleOptions}
              value={memberPostingRole}
              onChange={(value) =>
                setMemberPostingRole(value as SourceMemberRole)
              }
            />
          </SquadSettingsSection>
          <SquadSettingsSection
            title="Invitation permissions"
            description="Choose who is allowed to invite new members to this Squad."
          >
            <Radio
              name="memberInviteRole"
              options={memberRoleOptions}
              value={memberInviteRole}
              onChange={(value) =>
                setMemberInviteRole(value as SourceMemberRole)
              }
            />
          </SquadSettingsSection>
        </div>
      </form>
    </FormWrapper>
  );
}
