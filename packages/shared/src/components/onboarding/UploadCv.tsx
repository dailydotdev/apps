import type { ReactElement } from 'react';
import React from 'react';
import type { MutationStatus } from '@tanstack/react-query';
import { DragDrop } from '../fields/DragDrop';
import { fileValidation } from '../../features/profile/hooks/useUploadCv';

import {
  Button,
  ButtonVariant,
  ButtonIconPosition,
  ButtonSize,
} from '../buttons/Button';
import { OpenLinkIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';

interface UploadCvProps {
  headline: string;
  description?: string;
  dragDropDescription: string;
  ctaDesktop: string;
  ctaMobile: string;
  linkedin?: {
    cta?: string;
    image?: string;
    headline?: string;
    explainer?: string;
    steps?: string[];
  };
  onFilesDrop: (files: File[]) => void;
  status: MutationStatus;
  showLinkedInExport?: boolean;
}

export const UploadCv = ({
  headline,
  description,
  dragDropDescription,
  ctaDesktop,
  ctaMobile,
  linkedin,
  onFilesDrop,
  status,
  showLinkedInExport = true,
}: UploadCvProps): ReactElement => {
  const { user } = useAuthContext();

  const userLinkedIn = user?.linkedin
    ? `https://linkedin.com/in/${user.linkedin}`
    : `https://linkedin.com/`;

  return (
    <div className="flex w-full max-w-[49rem] flex-col items-center gap-6 p-6">
      <h2 className="text-center font-bold typo-large-title">{headline}</h2>
      {description && (
        <p className="text-center text-text-secondary typo-title3 laptop:px-14">
          {description}
        </p>
      )}
      <DragDrop
        state={status}
        isCompactList
        className="my-2 w-full laptop:min-h-32"
        onFilesDrop={onFilesDrop}
        validation={fileValidation}
        isCopyBold
        dragDropDescription={dragDropDescription}
        ctaLabelDesktop={ctaDesktop}
        ctaLabelMobile={ctaMobile}
      />
      {showLinkedInExport && linkedin && (
        <div className="hidden w-full items-start gap-6 p-6 laptop:flex">
          <div className="flex flex-1 flex-col gap-2">
            {linkedin.headline && (
              <h3 className="font-bold typo-title3">{linkedin.headline}</h3>
            )}
            {linkedin.explainer && (
              <p className="text-text-tertiary typo-callout">
                {linkedin.explainer}
              </p>
            )}
            {linkedin.steps && linkedin.steps.length > 0 && (
              <ol className="mt-2 flex flex-col gap-2 text-text-secondary typo-body">
                {linkedin.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
            {linkedin.cta && (
              <Button
                tag="a"
                href={userLinkedIn}
                target="_blank"
                rel="noopener"
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                icon={<OpenLinkIcon />}
                iconPosition={ButtonIconPosition.Right}
                className="mt-4 w-fit"
              >
                {linkedin.cta}
              </Button>
            )}
          </div>
          {linkedin.image && (
            <img
              src={linkedin.image}
              alt={linkedin.headline}
              className="shadow-sm h-[11.375rem] w-[21.4375rem] flex-shrink-0 self-start rounded-10 object-cover"
            />
          )}
        </div>
      )}
    </div>
  );
};
