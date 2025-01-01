import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import { TerminalIcon, TwitterIcon } from '../icons';
import { statusPage, twitter } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { useThemedAsset } from '../../hooks/utils';
import { cloudinaryGenericErrorDark } from '../../lib/image';

const ThemedImage = () => {
  const { gardrError } = useThemedAsset();
  return <img src={gardrError} alt="Production is down (FML)" />;
};

function ServerError({
  themedImage = false,
}: {
  themedImage?: boolean;
}): ReactElement {
  return (
    <div className="flex max-h-full w-full flex-col items-center justify-center gap-4 self-center text-center laptop:w-[21.25rem] laptop:max-w-[21.25rem]">
      {themedImage ? (
        <ThemedImage />
      ) : (
        <img src={cloudinaryGenericErrorDark} alt="Production is down (FML)" />
      )}
      <Typography type={TypographyType.LargeTitle} bold>
        Production is down
        <br />
        (FML)
      </Typography>
      <Typography
        type={TypographyType.Body}
        bold
        color={TypographyColor.Tertiary}
      >
        Our team&apos;s on it! Try refreshing the page and cross your fingers,
        or send our engineers some good vibes on X (Twitter).
      </Typography>
      <Button
        variant={ButtonVariant.Subtle}
        className="w-full"
        icon={<TerminalIcon />}
        href={statusPage}
        target="_blank"
        rel={anchorDefaultRel}
        tag="a"
      >
        Check system status
      </Button>
      <Button
        variant={ButtonVariant.Subtle}
        className="w-full"
        icon={<TwitterIcon />}
        href={twitter}
        target="_blank"
        rel={anchorDefaultRel}
        tag="a"
      >
        Cheer our engineers
      </Button>
    </div>
  );
}
export default ServerError;
