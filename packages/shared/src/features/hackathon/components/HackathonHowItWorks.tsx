import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities/common';
import Link from '../../../components/utilities/Link';
import { anchorDefaultRel } from '../../../lib/strings';
import { webappUrl } from '../../../lib/constants';

export const HackathonHowItWorks = (): ReactElement => {
  return (
    <FlexCol className="w-full max-w-4xl gap-6 px-4">
      <FlexCol className="gap-2">
        <Typography type={TypographyType.Title3} bold center>
          Format
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          center
        >
          <strong className="font-bold">
            5 days, fully async. Work on it at your own pace, from anywhere
          </strong>
          . To submit your submission, post about your project on social media
          tagging @dailydotdev with your live URL and a short summary.
        </Typography>
      </FlexCol>

      <FlexCol className="gap-2">
        <Typography type={TypographyType.Title3} bold center>
          Prizes
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          center
        >
          1 year of{' '}
          <Link href={`${webappUrl}plus`}>
            <a target="_blank" className="text-text-link underline">
              daily.dev Plus
            </a>
          </Link>{' '}
          with all the benefits for best submissions.{' '}
          <Link href="https://www.coderabbit.ai/pricing">
            <a target="_blank" className="text-[#FF570A] underline">
              3 free months of CodeRabbit Pro Plus.
            </a>
          </Link>{' '}
          Winning projects featured on daily.dev and social media.
        </Typography>
      </FlexCol>

      <FlexCol className="gap-2">
        <Typography type={TypographyType.Title3} bold center>
          Rules
        </Typography>
        <FlexCol className="gap-1 text-center text-text-secondary typo-callout">
          <p>
            Public URL required. Must be deployed and accessible on the
            internet.
          </p>
          <p>
            Don&apos;t rebuild things we already have. Bookmarks, top reader,
            reading streaks, briefings...
          </p>
          <p>
            Don&apos;t rebuild things we already have.{' '}
            <strong className="font-bold">
              Build on top, be creative, don&apos;t copy
            </strong>
            .
          </p>
          <p>
            <strong className="font-bold">Bonus points</strong> if your solution
            is explorable and shareable by other users (image, card, page,
            link).
          </p>
        </FlexCol>
      </FlexCol>

      <FlexCol className="gap-2">
        <Typography type={TypographyType.Title3} bold center>
          What we provide
        </Typography>
        <FlexCol className="gap-1 text-center text-text-secondary typo-callout">
          <p>
            <Link href="https://docs.daily.dev/docs/plus/public-api">
              <a
                className="text-text-link underline"
                target="_blank"
                rel={anchorDefaultRel}
              >
                API access
              </a>
            </Link>{' '}
            for all registered participants (no Plus requirement).
          </p>
          <p>
            <Link href="https://api.daily.dev/public/v1/docs/json">
              <a
                className="text-text-link underline"
                target="_blank"
                rel={anchorDefaultRel}
              >
                OpenAPI spec
              </a>
            </Link>{' '}
            for client generation in any language.
          </p>
          <p>
            Use whatever stack you want. Next.js, TanStack Start, Vite, Go, even
            PHP.
          </p>
          <p>
            Agent skills like{' '}
            <Link href={`${webappUrl}agents/ask`}>
              <a target="_blank" className="text-text-link underline">
                /daily-dev-ask
              </a>
            </Link>{' '}
            available to help you out.
          </p>
        </FlexCol>
      </FlexCol>
    </FlexCol>
  );
};
