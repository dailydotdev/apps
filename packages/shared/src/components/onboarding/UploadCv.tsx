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
import {
  Typography,
  TypographyTag,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { Image } from '../image/Image';
import { anchorDefaultRel } from '../../lib/strings';

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
  return (
    <div className="flex w-full max-w-[48.75rem] flex-col items-center gap-6 p-6">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.LargeTitle}
        bold
        center
      >
        {headline}
      </Typography>
      {description && (
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          center
          className="laptop:px-14"
        >
          {description}
        </Typography>
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
              <Typography
                tag={TypographyTag.H3}
                type={TypographyType.Title3}
                bold
              >
                {linkedin.headline}
              </Typography>
            )}
            {linkedin.explainer && (
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                {linkedin.explainer}
              </Typography>
            )}
            {linkedin.steps && linkedin.steps.length > 0 && (
              <Typography
                tag={TypographyTag.Ol}
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
                className="mt-2 flex flex-col gap-2"
              >
                {linkedin.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </Typography>
            )}
            {linkedin.cta && (
              <Button
                tag="a"
                href="https://linkedin.com/"
                target="_blank"
                rel={anchorDefaultRel}
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
            <Image
              src={linkedin.image}
              alt={linkedin.headline}
              className="shadow-sm aspect-[343/182] w-full max-w-[21.4375rem] flex-shrink-0 self-start rounded-10 object-cover"
            />
          )}
        </div>
      )}
    </div>
  );
};
