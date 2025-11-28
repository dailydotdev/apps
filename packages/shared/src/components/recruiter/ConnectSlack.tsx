import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { SlackIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { FlexCol, FlexRow } from '../utilities';
import Link from '../utilities/Link';
import { webappUrl } from '../../lib/constants';
import { Image, ImageType } from '../image/Image';

export const ConnectSlack = (): ReactElement => {
  return (
    <FlexCol className="mt-20 max-w-xl items-center gap-3 p-4 text-center">
      <FlexRow>
        <Image
          src=""
          className="border-surface-default z-3 size-14 rounded-full border-2"
          type={ImageType.Avatar}
        />
        <Image
          src=""
          className="border-surface-default z-2 -ml-4 size-14 rounded-full border-2"
          type={ImageType.Avatar}
        />
        <Image
          src=""
          className="border-surface-default z-1 -ml-4 size-14 rounded-full border-2"
          type={ImageType.Avatar}
        />
      </FlexRow>
      <Typography type={TypographyType.Mega3} bold>
        While we finish reviewing your campaign, join us on Slack
      </Typography>
      <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
        Get direct support from our team. Real humans. No tickets. No bots. Just
        real help when it matters.
      </Typography>
      <FlexRow className="gap-2 py-6">
        <Button
          variant={ButtonVariant.Primary}
          icon={<SlackIcon />}
          size={ButtonSize.Medium}
        >
          Connect Slack
        </Button>
        <Button variant={ButtonVariant.Secondary} size={ButtonSize.Medium}>
          Book a meeting
        </Button>
      </FlexRow>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        <Link passHref href={`${webappUrl}`}>
          <a className="underline">I don’t have Slack</a>
        </Link>
      </Typography>
    </FlexCol>
  );
};
