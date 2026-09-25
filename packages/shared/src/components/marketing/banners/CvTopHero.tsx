import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { TopHero } from './HeroBottomBanner';
import { fileValidation } from '../../../features/profile/hooks/useUploadCv';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { uploadCvBgMobile } from '../../../lib/image';

// Bare-illustration frame matched across the top cards so they line up
// vertically. Slightly wider than tall to give the CV cluster horizontal
// room without cropping.
const illustrationFrameClass =
  '!m-0 flex h-24 w-32 shrink-0 items-center justify-center self-center tablet:h-28 tablet:w-36';

const CvIllustration = (): ReactElement => (
  <div
    className={classNames(illustrationFrameClass, 'overflow-hidden')}
    aria-hidden
  >
    <span
      className="block size-full bg-no-repeat"
      style={{
        backgroundImage: `url(${uploadCvBgMobile})`,
        backgroundPosition: 'center top',
        backgroundSize: 'auto 220%',
      }}
    />
  </div>
);

type CvTopHeroProps = {
  subtitle: string;
  onUpload: (file: File) => void;
  onClose: () => void;
};

export const CvTopHero = ({
  subtitle,
  onUpload,
  onClose,
}: CvTopHeroProps): ReactElement => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logEvent } = useLogContext();

  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.CvBanner,
      target_id: TargetId.Feed,
    });
  }, [logEvent]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={fileValidation.acceptedExtensions
          .map((ext: string) => `.${ext}`)
          .join(',')}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }
          onUpload(file);
          // eslint-disable-next-line no-param-reassign
          event.target.value = '';
        }}
      />
      <TopHero
        subtitle={subtitle}
        ctaLabel="Upload CV"
        illustration={<CvIllustration />}
        onCtaClick={() => fileInputRef.current?.click()}
        onClose={onClose}
      />
    </>
  );
};
