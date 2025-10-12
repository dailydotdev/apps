import React from 'react';
import classNames from 'classnames';
import { CameraIcon, ClearIcon } from '../icons';
import { IconSize } from '../Icon';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { useControlledImageUpload } from '../../hooks/useControlledImageUpload';

interface ControlledCoverUploadProps {
  name: string;
  currentImage?: string;
  fileSizeLimitMB?: number;
  className?: string;
}

const ControlledCoverUpload = ({
  name,
  currentImage,
  fileSizeLimitMB = 5,
  className,
}: ControlledCoverUploadProps) => {
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
    fallbackImage: undefined,
  });

  return (
    <div
      className={classNames('group relative h-24 w-full', className)}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="relative h-full w-full overflow-hidden rounded-16">
        {displayImage ? (
          <img
            src={displayImage}
            alt="Profile cover"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-surface-float" />
        )}
      </div>
      <div className="absolute right-6 top-1/2 flex -translate-y-1/2 gap-2">
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

export default ControlledCoverUpload;
