import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { downloadBrowserExtension } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';
import { ChromeIcon } from '../../icons/Browser/Chrome';
import { EdgeIcon } from '../../icons/Browser/Edge';
import { LogEvent, TargetType } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import { useOnboardingExtension } from './useOnboardingExtension';
import { cloudinaryOnboardingExtension } from '../../../lib/image';
import { BrowserName } from '../../../lib/func';
import type { OnboardingOnClickNext } from '../common';

export const OnboardingExtension = ({
  onClickNext,
}: {
  onClickNext: OnboardingOnClickNext;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const { browserName } = useOnboardingExtension();
  const isEdge = browserName === BrowserName.Edge;
  const imageUrls = cloudinaryOnboardingExtension[browserName];

  return (
    <div className="flex flex-1 flex-col laptop:justify-between">
      <div className="mb-14 flex flex-col items-center gap-6 justify-self-start text-center">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
          className="!px-0"
        >
          Transform every new tab into a learning powerhouse
        </Typography>
        <Typography
          className="w-2/3 text-balance text-text-tertiary typo-body"
          color={TypographyColor.Secondary}
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
        >
          Unlock the power of every new tab with daily.dev extension.
          Personalized feed, developer communities, AI search and more!
        </Typography>
        <Button
          href={downloadBrowserExtension}
          icon={isEdge ? <EdgeIcon aria-hidden /> : <ChromeIcon aria-hidden />}
          onClick={() => {
            logEvent({
              event_name: LogEvent.DownloadExtension,
              target_id: isEdge ? TargetType.Edge : TargetType.Chrome,
            });
            onClickNext?.({ clickExtension: true });
          }}
          rel={anchorDefaultRel}
          tag="a"
          target="_blank"
          variant={ButtonVariant.Primary}
        >
          <span>Get it for {isEdge ? 'Edge' : 'Chrome'}</span>
        </Button>
        <Typography
          color={TypographyColor.Secondary}
          tag={TypographyTag.P}
          type={TypographyType.Body}
        >
          Dare to skip? <strong>You might miss out</strong>.
        </Typography>
      </div>
      <figure className="pointer-events-none mx-auto w-full laptopL:w-2/3">
        <img
          alt="Amazing daily.dev extension screenshot"
          className="w-full"
          loading="lazy"
          role="presentation"
          src={imageUrls.default}
          srcSet={`${imageUrls.default} 820w, ${imageUrls.retina} 1640w`}
        />
      </figure>
    </div>
  );
};
