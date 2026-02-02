import React from 'react';
import type { ReactElement } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { link } from '@dailydotdev/shared/src/lib';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';
import Link from '@dailydotdev/shared/src/components/utilities/Link';

export const AnalyticsEmptyState = (): ReactElement => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Title3}
          bold
          color={TypographyColor.Primary}
        >
          It&apos;s never too late to start posting
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="max-w-md"
        >
          Hardest part of being a developer? Where do we start... it&apos;s
          everything. Go on, share with us your best rant.
        </Typography>
      </div>
      <Link href={link.post.create} prefetch={false}>
        <Button variant={ButtonVariant.Primary} icon={<PlusIcon />} tag="a">
          New post
        </Button>
      </Link>
    </div>
  );
};
