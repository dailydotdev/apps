import React, { type ReactElement } from 'react';
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

export const OnboardingExtension = (): ReactElement => {
  const { logEvent } = useLogContext();

  const { shouldShowExtensionOnboarding, browser } = useOnboardingExtension();

  if (!shouldShowExtensionOnboarding) {
    return null;
  }

  return (
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
        Unlock the power of every new tab with daily.dev extension. Personalized
        feed, developer communities, AI search and more!
      </Typography>
      <Button
        href={downloadBrowserExtension}
        icon={
          browser.isEdge ? <EdgeIcon aria-hidden /> : <ChromeIcon aria-hidden />
        }
        onClick={() => {
          logEvent({
            event_name: LogEvent.DownloadExtension,
            target_id: browser.isEdge ? TargetType.Edge : TargetType.Chrome,
          });
        }}
        rel={anchorDefaultRel}
        tag="a"
        target="_blank"
        variant={ButtonVariant.Primary}
      >
        <span>Get it for Chrome</span>
      </Button>
      <Typography color={TypographyColor.Secondary}>
        Dare to skip? <strong>You might miss out</strong>.
      </Typography>
    </div>
  );
};
