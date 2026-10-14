import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { CameraIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { useFileInput } from '../../../../hooks/utils/useFileInput';
import { acceptedTypesList, ACCEPTED_TYPES } from '../../../../graphql/posts';

const IMAGE_SIZE_LIMIT_MB = 2;

interface SquadUploadButtonProps {
  label: string;
  onFile: (preview: string, file: File) => void;
  className?: string;
}

export const SquadUploadButton = ({
  label,
  onFile,
  className,
}: SquadUploadButtonProps): ReactElement => {
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
