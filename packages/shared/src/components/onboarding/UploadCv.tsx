import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
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
    <div className="flex w-full flex-col items-center gap-6 p-6">
      <div className="flex w-full max-w-[49rem] flex-col items-center gap-4">
        <h2 className="typo-large-title text-center font-bold">{headline}</h2>
        {description && (
          <div className="text-text-secondary typo-title3 laptop:px-14 text-center">
            {description}
          </div>
        )}
        <DragDrop
          state={status}
          isCompactList
          className={classNames('laptop:min-h-32 my-2 w-full')}
          onFilesDrop={onFilesDrop}
          validation={fileValidation}
          isCopyBold
          dragDropDescription={dragDropDescription}
          ctaLabelDesktop={ctaDesktop}
          ctaLabelMobile={ctaMobile}
        />
        {showLinkedInExport && linkedin && (
          <div className="laptop:flex hidden w-full flex-col items-center">
            <div className="flex w-full items-start gap-6 p-6">
              <div className="flex flex-1 flex-col gap-2">
                <h3 className="typo-title3 font-bold">
                  {linkedin.headline || 'Export from LinkedIn'}
                </h3>
                {linkedin.explainer && (
                  <p className="text-text-tertiary typo-callout">
                    {linkedin.explainer}
                  </p>
                )}
                {linkedin.steps && linkedin.steps.length > 0 && (
                  <ol className="text-text-secondary typo-body mt-2 flex flex-col gap-2">
                    {linkedin.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                )}
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
                  {linkedin.cta || 'Go to your LinkedIn Profile'}
                </Button>
              </div>
              {linkedin.image && (
                <div className="flex-shrink-0 self-start">
                  <img
                    src={linkedin.image}
                    alt={linkedin.headline || 'LinkedIn export guide'}
                    className="rounded-10 h-[11.375rem] w-[21.4375rem] object-cover shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
