import type { PropsWithChildren, ReactElement } from 'react';
import React, { useRef } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { DragDrop } from '../../../components/fields/DragDrop';
import { uploadCvBg } from '../../../lib/image';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon } from '../../../components/icons';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { cvUploadBannerBg } from '../../../styles/custom';

const defaultBanner = {
  title: 'Your next job should apply to you',
  description:
    'Upload your CV so we quietly match you with roles you might actually want. Nothing is shared without your ok.',
  cover: uploadCvBg,
};

interface ProfileUploadBannerProps {
  banner?: {
    title: string;
    description: string;
    cover?: string;
  };
}

export function ProfileUploadBanner({
  children,
  banner = defaultBanner,
}: PropsWithChildren<ProfileUploadBannerProps>): ReactElement {
  const { completeAction } = useActions();
  const inputRef = useRef<HTMLInputElement>();

  return (
    <div className="flex w-full flex-col">
      <div
        style={{ background: cvUploadBannerBg }}
        className="relative mx-auto my-3 flex w-full max-w-[63.75rem] flex-col overflow-hidden rounded-10 border border-border-subtlest-tertiary px-4 py-3"
      >
        <div className="flex w-full max-w-[26.5rem] flex-col gap-2">
          <Typography type={TypographyType.Title2} bold>
            {banner.title}
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            {banner.description}
          </Typography>
          <DragDrop
            isCompactList
            inputRef={inputRef}
            className="my-4"
            onFilesDrop={(file) => file}
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Feeling lazy?{' '}
            <button
              type="button"
              className="underline hover:no-underline"
              onClick={() => inputRef?.current.click()}
            >
              Import your CV from LinkedIn
            </button>
          </Typography>
        </div>
        <img
          className="pointer-events-none absolute right-0 top-0 -rotate-[15] object-cover"
          src={banner.cover || defaultBanner.cover}
          alt="Animated money, devices, and a rubber duck"
        />
        <Button
          className="absolute right-2 top-2"
          variant={ButtonVariant.Tertiary}
          icon={<MiniCloseIcon />}
          size={ButtonSize.Small}
          onClick={() => completeAction(ActionType.ClosedProfileBanner)}
        />
      </div>
      {children}
    </div>
  );
}
