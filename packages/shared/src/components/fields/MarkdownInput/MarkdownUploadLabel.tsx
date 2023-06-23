import React, { ReactElement } from 'react';

interface MarkdownInputFooterProps {
  uploadingCount: number;
  uploadedCount: number;
}

export function MarkdownUploadLabel({
  uploadingCount,
  uploadedCount,
}: MarkdownInputFooterProps): ReactElement {
  if (uploadingCount === 0) {
    return (
      <span className="hidden laptop:flex">
        Attach images by dragging & dropping
      </span>
    );
  }

  return (
    <>
      Uploading in progress
      {uploadingCount > 1 ? ` (${uploadedCount}/${uploadingCount})` : ''}
    </>
  );
}
