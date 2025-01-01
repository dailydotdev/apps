import type { FormEvent, ReactElement, ReactNode } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { ClientError } from 'graphql-request';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { ButtonColor, ButtonSize, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { ArrowIcon, AtIcon, CameraIcon, SlackIcon, SquadIcon } from '../icons';
import Textarea from '../fields/Textarea';
import ImageInput from '../fields/ImageInput';
import { cloudinarySquadsImageFallback } from '../../lib/image';
import { formToJson } from '../../lib/form';
import type { SquadForm } from '../../graphql/squads';
import { checkExistingHandle } from '../../graphql/squads';
import { capitalize } from '../../lib/strings';
import { IconSize } from '../Icon';
import { FormWrapper } from '../fields/form';
import { SquadPrivacySection } from './settings/SquadPrivacySection';
import { SquadModerationSettingsSection } from './settings/SquadModerationSettingsSection';
import { SquadSettingsSection } from './settings';
import { SquadStats } from './common/SquadStat';
import { SquadPrivacyState } from './common/SquadPrivacyState';
import { SquadDangerZone } from './settings/SquadDangerZone';
import type { Squad } from '../../graphql/sources';
import { useViewSize, ViewSize } from '../../hooks';
import { useSlackChannelsQuery } from '../../hooks/integrations/slack/useSlackChannelsQuery';
import { Dropdown } from '../fields/Dropdown';
import { Typography, TypographyType } from '../typography/Typography';

const squadImageId = 'squad_image_file';

interface SquadDetailsProps {
  onSubmit: (
    e: FormEvent,
    formJson: SquadForm,
    selectedChannel?: string,
  ) => void;
  onRequestClose?: () => void;
  children?: ReactNode;
  isLoading?: boolean;
  squad?: Squad;
  initialData?: Partial<Squad>;
  integrationId?: string;
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

  return { ...current, file };
};

export function SquadDetails({
  onSubmit,
  children,
  isLoading,
  squad,
  initialData = {},
  integrationId,
}: SquadDetailsProps): ReactElement {
  const createMode = !squad;
  const {
    name,
    handle,
    description,
    image,
    category,
    flags,
    memberPostingRole: initialMemberPostingRole,
    memberInviteRole: initialMemberInviteRole,
    moderationRequired: initialModerationRequired,
  } = squad ?? { ...initialData };
  const [activeHandle, setActiveHandle] = useState(handle);
  const [imageChanged, setImageChanged] = useState(false);
  const [handleHint, setHandleHint] = useState<string>(null);
  const [canSubmit, setCanSubmit] = useState(!!name && !!activeHandle);
  const [categoryHint, setCategoryHint] = useState('');
  const [isDescriptionOpen, setDescriptionOpen] = useState(!createMode);
  const [selectedChannel, setSelectedChannel] = useState<string>(null);
  const router = useRouter();
  const isMobile = useViewSize(ViewSize.MobileL);

  const { data: channels } = useSlackChannelsQuery({
    integrationId,
    queryOptions: { enabled: createMode },
  });

  const selectedChannelIndex = useMemo(() => {
    return channels?.findIndex((item) => item.id === selectedChannel) || 0;
  }, [channels, selectedChannel]);

  const { mutateAsync: onValidateHandle } = useMutation({
    mutationFn: checkExistingHandle,
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

    if (formJson.status === 'public' && !formJson.categoryId) {
      setCategoryHint('Please select a category');
      return null;
    }

    const data = await getFormData(formJson, imageChanged);

    if (!createMode) {
      return onSubmit(e, data, channels?.[selectedChannelIndex]?.id);
    }

    const handleExists = await onValidateHandle(formJson.handle);
    setHandleHint(handleExists ? 'The handle already exists' : null);

    if (!handleExists) {
      return onSubmit(e, data, channels?.[selectedChannelIndex]?.id);
    }

    return null;
  };

  const handleChange = (e: FormEvent<HTMLFormElement>) => {
    const formJson = formToJson<SquadForm>(e.currentTarget);

    // Auto-populate the handle if name is provided and handle empty
    if (formJson.name && !activeHandle && !formJson.handle) {
      setActiveHandle(formJson.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));
    }

    if (formJson.status === 'public' && formJson.categoryId) {
      setCategoryHint('');
    }

    setCanSubmit(!!formJson.name);
  };

  return (
    <FormWrapper
      form="squad-form"
      isHeaderTitle={!isMobile}
      title={createMode ? undefined : 'Squad settings'}
      className={{
        container: 'flex flex-1 flex-col',
        title: 'px-4 font-bold typo-title3 tablet:px-0',
        header: 'border-b-0',
      }}
      copy={{
        right: createMode ? 'Create Squad' : 'Save',
        left: isMobile ? 'Cancel' : null,
      }}
      leftButtonProps={{
        icon: isMobile ? null : <ArrowIcon className="-rotate-90" />,
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
        className="flex w-full flex-col justify-center gap-6 p-6"
        onSubmit={handleSubmit}
        onBlur={handleChange}
        id="squad-form"
      >
        {!createMode && (
          <div className="flex flex-col items-center gap-5">
            <ImageInput
              initialValue={image}
              id={squadImageId}
              fallbackImage={cloudinarySquadsImageFallback}
              className={{
                container: 'mt-4 !rounded-full border-0',
                img: 'object-cover',
              }}
              hoverIcon={<CameraIcon size={IconSize.Large} />}
              alwaysShowHover={!imageChanged}
              onChange={() => setImageChanged(true)}
              size="medium"
            />
            <SquadPrivacyState
              isPublic={squad?.public}
              isFeatured={flags?.featured}
            />
            <SquadStats flags={flags} />
          </div>
        )}
        <SquadSettingsSection title="Squad details" className="!gap-4">
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
              className="ml-4 mr-auto font-bold text-text-tertiary typo-callout"
              type="button"
              onClick={() => {
                setDescriptionOpen((current) => !current);
              }}
            >
              + Add description (recommended)
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
        </SquadSettingsSection>
        {integrationId ? (
          <SquadSettingsSection title="Integrations" className="!gap-4">
            <div className="flex h-10 items-center gap-2 rounded-14 bg-surface-float px-2">
              <SlackIcon />{' '}
              <Typography type={TypographyType.Body}>
                {initialData.name}
              </Typography>
            </div>
            {!!channels?.length && (
              <Dropdown
                placeholder="Select channel"
                shouldIndicateSelected
                buttonSize={ButtonSize.Medium}
                iconOnly={false}
                selectedIndex={selectedChannelIndex}
                renderItem={(_, index) => (
                  <span className="typo-callout">{`#${channels[index].name}`}</span>
                )}
                options={channels?.map((item) => `#${item.name}`)}
                onChange={(_, index) => setSelectedChannel(channels[index].id)}
                scrollable
              />
            )}
          </SquadSettingsSection>
        ) : undefined}
        <SquadPrivacySection
          initialCategory={category?.id}
          isPublic={squad?.public}
          categoryHint={categoryHint}
          onCategoryChange={useCallback(() => setCategoryHint(''), [])}
        />
        <SquadModerationSettingsSection
          initialMemberInviteRole={initialMemberInviteRole}
          initialMemberPostingRole={initialMemberPostingRole}
          initialModerationRequired={initialModerationRequired}
        />
        {!createMode && <SquadDangerZone squad={squad} />}
      </form>
    </FormWrapper>
  );
}
