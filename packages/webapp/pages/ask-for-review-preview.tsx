import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { AskForReviewStripView } from '@dailydotdev/shared/src/components/postReview/AskForReviewStrip';
import AskForReviewConfirmModal from '@dailydotdev/shared/src/components/modals/AskForReviewConfirmModal';
import type { ReviewDestination } from '@dailydotdev/shared/src/lib/askForReview';
import { askForReviewPlaceholderImage } from '@dailydotdev/shared/src/lib/image';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

// Visual-only preview harness for the ask-for-review prompt. Renders the strip
// in every store destination plus the confirm modal against mock data, so the
// design can be reviewed without seeding streak/GrowthBook state. Not linked
// from navigation — open /ask-for-review-preview directly.

const makeDest = (
  id: ReviewDestination['id'],
  label: string,
  headline: string,
  body: string,
  ctaText: string,
): ReviewDestination => ({
  id,
  label,
  href: '#',
  headline,
  body,
  ctaText,
  image: askForReviewPlaceholderImage,
});

const DESTINATIONS: ReviewDestination[] = [
  makeDest(
    'chrome_web_store',
    'Chrome Web Store',
    'Help fellow devs find daily.dev 💜',
    "Take 10 seconds to rate daily.dev on the Chrome Web Store. Your review helps other developers trust it's worth installing.",
    'Rate on Chrome Web Store',
  ),
  makeDest(
    'edge_addons',
    'Edge Add-ons',
    'Help fellow devs find daily.dev 💜',
    "Take 10 seconds to rate daily.dev on Microsoft Edge Add-ons. Your review helps other developers trust it's worth installing.",
    'Rate on Edge Add-ons',
  ),
  makeDest(
    'firefox_addons',
    'Firefox Add-ons',
    'Help fellow devs find daily.dev 💜',
    "Take 10 seconds to rate daily.dev on Firefox Add-ons. Your review helps other developers trust it's worth installing.",
    'Rate on Firefox Add-ons',
  ),
  makeDest(
    'app_store',
    'App Store',
    'Help fellow devs find daily.dev 💜',
    "Take 10 seconds to rate daily.dev on the App Store. Your review helps other developers trust it's worth the download.",
    'Rate on the App Store',
  ),
  makeDest(
    'play_store',
    'Play Store',
    'Help fellow devs find daily.dev 💜',
    "Take 10 seconds to rate daily.dev on Google Play. Your review helps other developers trust it's worth the download.",
    'Rate on Google Play',
  ),
  makeDest(
    'twitter_share',
    'X',
    'Spread the word 💜',
    "We can't send you to a review page from this browser, but a quick post on X helps other devs discover daily.dev.",
    'Share on X',
  ),
];

const STREAK_VALUES = [3, 7, 30];

const AskForReviewPreview = (): ReactElement => {
  const [modalDest, setModalDest] = useState<ReviewDestination | null>(null);

  return (
    <main className="mx-auto flex max-w-[44rem] flex-col gap-10 px-4 py-10">
      <header className="flex flex-col gap-2">
        <Typography type={TypographyType.LargeTitle} bold>
          Ask-for-review — visual preview
        </Typography>
        <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
          Mock-only harness. Every store destination of the in-content strip,
          plus the confirm modal. No real auth, streak, or GrowthBook gating.
        </Typography>
      </header>

      <section className="flex flex-col gap-4">
        <Typography type={TypographyType.Title3} bold>
          1. In-content strip — per destination
        </Typography>
        {DESTINATIONS.map((destination) => (
          <div key={destination.id} className="flex flex-col gap-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Quaternary}
            >
              {destination.id}
            </Typography>
            <AskForReviewStripView
              destination={destination}
              streakValue={7}
              onAction={() => undefined}
              onClose={() => undefined}
            />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <Typography type={TypographyType.Title3} bold>
          2. Strip — streak copy variations
        </Typography>
        {STREAK_VALUES.map((streakValue) => (
          <AskForReviewStripView
            key={streakValue}
            destination={DESTINATIONS[0]}
            streakValue={streakValue}
            onAction={() => undefined}
            onClose={() => undefined}
          />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <Typography type={TypographyType.Title3} bold>
          3. Confirm modal — open per destination
        </Typography>
        <div className="flex flex-wrap gap-2">
          {DESTINATIONS.map((destination) => (
            <Button
              key={destination.id}
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Secondary}
              onClick={() => setModalDest(destination)}
            >
              {destination.label}
            </Button>
          ))}
        </div>
      </section>

      {modalDest && (
        <AskForReviewConfirmModal
          isOpen
          destination={modalDest}
          streakValue={7}
          onRequestClose={() => setModalDest(null)}
        />
      )}
    </main>
  );
};

export default AskForReviewPreview;
