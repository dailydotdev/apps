import React from 'react';
import { CameraIcon, ClearIcon } from '../icons';
import { IconSize } from '../Icon';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { fallbackImages } from '../../lib/config';
import { useControlledImageUpload } from '../../hooks/useControlledImageUpload';

interface ControlledAvatarUploadProps {
  name: string;
  currentImage?: string;
  fileSizeLimitMB?: number;
}

const ControlledAvatarUpload = ({
  name,
  currentImage,
  fileSizeLimitMB = 1,
}: ControlledAvatarUploadProps) => {
  const {
    displayImage,
    inputRef,
    onFileChange,
    onDragOver,
    onDrop,
    handleUploadClick,
    handleRemove,
    acceptedTypes,
  } = useControlledImageUpload({
    name,
    fileSizeLimitMB,
    currentImage,
    fallbackImage: fallbackImages.avatar,
  });

  return (
    <div
      className="group relative size-[120px]"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="relative size-full overflow-hidden rounded-26">
        <img
          src={displayImage}
          alt="Profile avatar"
          className="size-full object-cover"
        />
      </div>
      <div className="cursor:pointer absolute top-0 flex h-full w-full items-center justify-center gap-2 rounded-26">
        <Button
          type="button"
          className="bg-shadow-shadow3"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<CameraIcon size={IconSize.Medium} />}
          onClick={handleUploadClick}
        />
        <Button
          type="button"
          className="bg-shadow-shadow3"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<ClearIcon size={IconSize.Medium} />}
          onClick={handleRemove}
        />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes}
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
};

export default ControlledAvatarUpload;
