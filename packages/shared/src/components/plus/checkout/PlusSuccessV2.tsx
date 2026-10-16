import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { LogoWithPlus } from '../../Logo';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BriefIcon, VIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useAuthContext } from '../../../contexts/AuthContext';
import { briefingUrl, webappUrl } from '../../../lib/constants';

/* /plus/success in the new checkout: one next action per purchase, and only
   promises that hold — Paddle emails the receipt; a gift recipient sees an
   in-app pop-up on their next visit (GiftReceivedPlusModal). */

const copyFor = (purchase: string | undefined, email?: string) => {
  const receipt = email
    ? `Paddle emails your receipt to ${email}.`
    : 'Paddle emails your receipt.';
  if (purchase === 'gift') {
    return {
      title: 'Plus is on its way.',
      body: `They’ll see a “you got Plus” pop-up from you the next time they open daily.dev. One year, no renewal. ${receipt}`,
    };
  }
  if (purchase === 'team') {
    return {
      title: 'Your team is on Plus.',
      body: `${receipt} Next: invite your team — each member gets every Plus feature.`,
    };
  }
  return {
    title: 'Welcome to Plus.',
    body: `Ads are off and every Plus feature is on. ${receipt}`,
  };
};

export const PlusSuccessV2 = (): ReactElement => {
  const { query } = useRouter();
  const { user } = useAuthContext();
  const purchase =
    typeof query.purchase === 'string' ? query.purchase : undefined;
  const copy = copyFor(purchase, user?.email);

  return (
    <div
      className="flex min-h-dvh w-full flex-col items-center justify-center bg-background-default px-4 py-12 text-text-primary"
      style={{
        background:
          'radial-gradient(56.25rem 37.5rem at 50% 0%, color-mix(in srgb, var(--theme-accent-onion-default) 22%, transparent), transparent 60%)',
      }}
    >
      <div className="flex w-full max-w-[30rem] flex-col items-center gap-6 text-center">
        <LogoWithPlus />
        <span className="grid size-14 place-items-center rounded-full bg-accent-avocado-default text-surface-invert">
          <VIcon size={IconSize.Large} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-balance font-bold typo-title2">{copy.title}</h1>
          <p className="text-pretty text-text-tertiary typo-callout">
            {copy.body}
          </p>
        </div>
        {!purchase && (
          <a
            href={briefingUrl}
            className="flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left hover:bg-surface-hover"
          >
            <span className="grid size-10 flex-none place-items-center rounded-12 bg-overlay-float-cabbage text-accent-cabbage-default">
              <BriefIcon secondary size={IconSize.Medium} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <b className="typo-callout">Read your Presidential Briefing</b>
              <span className="text-text-tertiary typo-footnote">
                What moved in your stack, in a few minutes.
              </span>
            </span>
          </a>
        )}
        <div className="flex w-full flex-col gap-2">
          {purchase === 'team' && (
            <Button
              tag="a"
              href={`${webappUrl}settings/organization`}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
            >
              Invite your team
            </Button>
          )}
          {!purchase && (
            <Button
              tag="a"
              href={briefingUrl}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
            >
              Open your Briefing
            </Button>
          )}
          <Button
            tag="a"
            href={webappUrl}
            variant={
              purchase === 'gift'
                ? ButtonVariant.Primary
                : ButtonVariant.Tertiary
            }
            size={ButtonSize.Large}
          >
            {purchase === 'gift' ? 'Back to daily.dev' : 'Go to my feed'}
          </Button>
        </div>
      </div>
    </div>
  );
};
