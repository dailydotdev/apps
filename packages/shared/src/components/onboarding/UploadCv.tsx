import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import { DragDrop } from '../fields/DragDrop';
import {
  useUploadCv,
  fileValidation,
} from '../../features/profile/hooks/useUploadCv';

interface UploadCvProps {
  headline: string;
  description: string;
  cta1: string;
  cta2: string;
  cta3: string;
  image: string;
  onUploadSuccess?: () => void;
}

export const UploadCv = ({
  headline,
  description,
  cta1,
  cta2,
  cta3,
  image,
  onUploadSuccess,
}: UploadCvProps): ReactElement => {
  const { onUpload, status } = useUploadCv({
    onUploadSuccess,
    shouldOpenModal: false,
  });

  const handleUpload = (files: File[]) => {
    if (files.length > 0) {
      onUpload(files[0]);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="typo-bold typo-large-title mb-10 text-center">
        {headline}
      </h2>
      {description && <div>{description}</div>}
      <DragDrop
        state={status}
        isCompactList
        className={classNames('mb-0 mt-4 laptop:mb-4')}
        onFilesDrop={handleUpload}
        validation={fileValidation}
        isCopyBold
        dragDropDescription={cta1}
        ctaLabel={cta2}
      />

      <Button>{cta3}</Button>
      <img alt="Upload CV" src={image} />
    </div>
  );
};
