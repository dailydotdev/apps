import React, { ReactElement } from 'react';

import { useThemedAsset } from '../hooks/utils';
import { statusPage, twitter } from '../lib/constants';
import { anchorDefaultRel } from '../lib/strings';
import { Button, ButtonVariant } from './buttons/Button';
import { TerminalIcon, TwitterIcon } from './icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from './typography/Typography';
import { PageContainer } from './utilities';

function FeedErrorScreen(): ReactElement {
  const { gardrError } = useThemedAsset();

  return (
    <PageContainer className="mx-auto !ml-0 !min-h-[calc(100vh-228px)] items-center justify-center tablet:!min-h-[calc(100vh-104px)]">
      <div className="flex max-h-full w-full flex-col items-center justify-center gap-4 self-center text-center laptop:w-[21.25rem] laptop:max-w-[21.25rem]">
        <img src={gardrError} alt="Production is down (FML)" />
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
    </PageContainer>
  );
}

export default FeedErrorScreen;
