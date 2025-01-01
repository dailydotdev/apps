import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ChecklistAIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { NextSeo } from 'next-seo';
import { getPlusLayout } from '../../components/layouts/PlusLayout/PlusLayout';

const PlusSuccessPage = (): ReactElement => {
  return (
    <>
      <NextSeo nofollow noindex />
      <div className="flex flex-1 items-center justify-center gap-20">
        <div className="flex max-w-[28.5rem] flex-col items-center">
          <ChecklistAIcon
            size={IconSize.XXXLarge}
            className="mb-4 text-action-plus-default"
          />
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            bold
          >
            Payment successful
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            className="my-6"
          >
            Success! Your payment is complete, you’re all set.
          </Typography>
          <Link href={webappUrl} passHref>
            <Button
              variant={ButtonVariant.Primary}
              tag="a"
              size={ButtonSize.Large}
            >
              Back to daily.dev
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

PlusSuccessPage.getLayout = getPlusLayout;

export default PlusSuccessPage;
