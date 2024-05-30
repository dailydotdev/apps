import * as React from 'react';
import Link from 'next/link';
import { DevCardTheme, themeToLinearGradient } from '../profile/devcard';
import { anchorDefaultRel } from '../../lib/strings';
import { Button, ButtonSize } from '../buttons/Button';
import { LazyImage } from '../LazyImage';
import { cloudinary } from '../../lib/image';
import { link } from '../../lib/links';

export const HypeCampaign = (): JSX.Element => {
  return (
    <div
      className="mb-8 flex flex-col rounded-16 p-1"
      style={{
        backgroundImage: themeToLinearGradient[DevCardTheme.Diamond],
      }}
    >
      <div className="flex max-w-full flex-col rounded-12 bg-background-default p-4 pt-5 laptop:flex-row">
        <div className="mb-5 flex-1 laptop:mb-0">
          <Link href={link.referral.hypeLink}>
            <a
              className="mb-4 mt-0 flex flex-wrap bg-clip-text font-bold text-transparent typo-title2"
              target="_blank"
              style={{
                backgroundImage: themeToLinearGradient[DevCardTheme.Diamond],
              }}
              rel={anchorDefaultRel}
            >
              Want to win a free t-shirt?
            </a>
          </Link>

          <p className="mb-4 typo-callout">
            <strong>Win a limited-edition Kawaii t-shirt!</strong> We&apos;re
            blowing up! Spread the word, win a t-shirt. We&apos;re giving one
            away every 24 hours until the end of June.
          </p>

          <Button
            size={ButtonSize.Small}
            style={{
              background: themeToLinearGradient[DevCardTheme.Diamond],
            }}
            tag="a"
            target="_blank"
            rel={anchorDefaultRel}
            href={link.referral.hypeLink}
          >
            I want in
          </Button>
        </div>

        <Link href={link.referral.hypeLink}>
          <a
            className="block h-fit cursor-pointer overflow-hidden rounded-10 laptop:ml-3 laptop:w-[244px]"
            target="_blank"
            rel={anchorDefaultRel}
          >
            <LazyImage
              imgSrc={cloudinary.referralCampaign.hypeCampaign}
              imgAlt="daily.dev June ambassador program t-shirt"
              ratio="72%"
              eager
            />
          </a>
        </Link>
      </div>
    </div>
  );
};
