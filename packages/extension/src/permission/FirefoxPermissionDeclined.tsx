import React, { ReactElement } from 'react';
import {
  cloudinaryFeedBgLaptop,
  cloudinaryGenericErrorDark,
} from '@dailydotdev/shared/src/lib/image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { FirefoxPermissionContainer } from './common';

interface FirefoxPermissionDeclinedProps {
  onGoBack(): void;
}

export function FirefoxPermissionDeclined({
  onGoBack,
}: FirefoxPermissionDeclinedProps): ReactElement {
  return (
    <FirefoxPermissionContainer className="justify-center">
      <img
        src={cloudinaryFeedBgLaptop}
        alt="a glowing background"
        className="pointer-events-none absolute -top-10 -z-1 select-none"
      />
      <div className="flex w-full max-w-[35rem] flex-col items-center gap-4">
        <span className="h-36 max-w-[16.25rem]">
          <img src={cloudinaryGenericErrorDark} alt="You declined (FML)" />
        </span>
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
        >
          You declined.
        </Typography>
        <Typography
          color={TypographyColor.Secondary}
          tag={TypographyTag.H1}
          type={TypographyType.Body}
          className="text-center"
        >
          We understand your choice, but just so you know, we’ll need those
          permissions to deliver any content. Without them, it’s like trying to
          code without a keyboard!
        </Typography>
        <Typography
          color={TypographyColor.Secondary}
          tag={TypographyTag.H1}
          type={TypographyType.Body}
          className="text-center"
        >
          You can{' '}
          <button type="button" className="text-text-link" onClick={onGoBack}>
            go back
          </button>{' '}
          and accept the required permissions or use our{' '}
          <a className="text-text-link" href={webappUrl} rel={anchorDefaultRel}>
            web app
          </a>{' '}
          instead.
        </Typography>
      </div>
    </FirefoxPermissionContainer>
  );
}
