import type { FormEvent, ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { TextField } from '../../../../components/fields/TextField';
import Textarea from '../../../../components/fields/Textarea';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { AtIcon, CameraIcon, SquadIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import { SquadImage } from '../../../../components/squads/SquadImage';
import {
  PrivacyOption,
  SquadPrivacySection,
} from '../../../../components/squads/settings/SquadPrivacySection';
import { useFileInput } from '../../../../hooks/utils/useFileInput';
import { formToJson } from '../../../../lib/form';
import { acceptedTypesList, ACCEPTED_TYPES } from '../../../../graphql/posts';
import { useSquadPageContext } from '../../SquadPageContext';
import { useEditSquad } from '../../hooks/useEditSquad';
import { getSquadManageUrl, SquadManageSection } from '../../lib/routes';
import {
  SquadManageSaveButton,
  SquadManageSectionPanel,
} from './SquadManageLayout';

const squadDetailsFormId = 'squad-manage-details';

const IMAGE_SIZE_LIMIT_MB = 2;

type DetailsFields = {
  name: string;
  handle: string;
  description: string;
  status: PrivacyOption;
  categoryId?: string;
};

const UploadButton = ({
  label,
  onFile,
  className,
}: {
  label: string;
  onFile: (preview: string, file: File) => void;
  className?: string;
}): ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { onFileChange } = useFileInput({
    limitMb: IMAGE_SIZE_LIMIT_MB,
    acceptedTypes: acceptedTypesList,
    onChange: onFile,
  });

  return (
    <div className={classNames('flex', className)}>
      <Button
        type="button"
        className="bg-shadow-shadow3"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<CameraIcon size={IconSize.Medium} />}
        aria-label={`Upload ${label}`}
        onClick={() => inputRef.current?.click()}
      />
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(event) => onFileChange(event.target.files?.[0])}
      />
    </div>
  );
};

export const SquadManageDetails = (): ReactElement => {
  const router = useRouter();
  const { squad } = useSquadPageContext();
  const { onEdit, isPending } = useEditSquad(squad);
  const [cover, setCover] = useState<{ preview: string; file: File }>();
  const [image, setImage] = useState<{ preview: string; file: File }>();
  const [categoryHint, setCategoryHint] = useState('');
  const onCategoryChange = useCallback(() => setCategoryHint(''), []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = formToJson<DetailsFields>(event.currentTarget);

    if (!fields.name?.trim() || !fields.handle?.trim()) {
      return;
    }

    if (fields.status === PrivacyOption.Public && !fields.categoryId) {
      setCategoryHint('Please select a category');
      return;
    }

    const updated = await onEdit({
      ...fields,
      file: image?.file,
      header: cover?.file,
    }).catch(() => null);

    if (updated && updated.handle !== squad.handle) {
      router.replace(
        getSquadManageUrl(updated.handle, SquadManageSection.Details),
      );
    }
  };

  const coverImage = cover?.preview ?? squad.headerImage;

  return (
    <SquadManageSectionPanel
      section={SquadManageSection.Details}
      action={
        <SquadManageSaveButton
          formId={squadDetailsFormId}
          isLoading={isPending}
        />
      }
    >
      <form
        id={squadDetailsFormId}
        onSubmit={onSubmit}
        className="flex flex-col gap-6 px-4 py-6 tablet:px-6"
      >
        <div className="relative mb-10">
          <div className="relative h-24 w-full overflow-hidden rounded-16 bg-surface-float">
            {coverImage && (
              <img
                src={coverImage}
                alt="Squad cover"
                className="size-full object-cover"
              />
            )}
            <UploadButton
              label="cover"
              onFile={(preview, file) => setCover({ preview, file })}
              className="absolute right-6 top-1/2 -translate-y-1/2"
            />
          </div>
          <div className="absolute bottom-0 left-6 size-24 translate-y-1/2">
            {image ? (
              <img
                src={image.preview}
                alt="Squad logo"
                className="size-full rounded-full bg-background-default object-cover"
              />
            ) : (
              <SquadImage
                {...squad}
                className="size-full bg-background-default"
              />
            )}
            <UploadButton
              label="image"
              onFile={(preview, file) => setImage({ preview, file })}
              className="absolute inset-0 items-center justify-center"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <TextField
            inputId="squad-name"
            name="name"
            label="Squad name"
            leftIcon={<SquadIcon />}
            defaultValue={squad.name}
            className={{ container: 'w-full' }}
          />
          <TextField
            inputId="squad-handle"
            name="handle"
            label="Squad handle"
            leftIcon={<AtIcon />}
            defaultValue={squad.handle}
            className={{ container: 'w-full' }}
          />
          <Textarea
            inputId="squad-description"
            name="description"
            label="Squad description"
            defaultValue={squad.description}
            rows={3}
            maxLength={250}
          />
        </div>
        <HorizontalSeparator />
        <SquadPrivacySection
          isPublic={squad.public}
          initialCategory={squad.category?.id ?? ''}
          categoryHint={categoryHint}
          onCategoryChange={onCategoryChange}
        />
      </form>
    </SquadManageSectionPanel>
  );
};
