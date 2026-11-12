import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { WebKitMessageHandlers } from '@dailydotdev/shared/src/lib/ios';
import type { MarketingCta } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { MarketingCtaVariant } from '@dailydotdev/shared/src/components/marketing/cta/common';
import AppStoreReviewModal from '@dailydotdev/shared/src/components/modals/AppStoreReviewModal';
import PlusRenewalReviewModal from '@dailydotdev/shared/src/components/modals/PlusRenewalReviewModal';
import { ResourceSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/ResourceSection';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { cloudinaryGiftedPlusModalImage } from '@dailydotdev/shared/src/lib/image';
import { defaultBootData, getBootMock } from '../../mock/boot';

// The shipped surfaces behind the App Store review asks, on a fake iOS 1.26
// bridge so the review handlers exist. Every message the web app posts to the
// bridge is listed under the surface, since Apple's pop-up and Write a Review
// screen only exist on a device.

type BridgeMessage = { handler: WebKitMessageHandlers; at: string };

type WebKitGlobal = typeof globalThis & {
  webkit?: {
    messageHandlers?: Partial<
      Record<WebKitMessageHandlers, { postMessage: (payload: unknown) => void }>
    >;
  };
};

const reviewHandlers = [
  WebKitMessageHandlers.ReviewRequest,
  WebKitMessageHandlers.ReviewOpenStore,
];

const useIOSBridge = (): BridgeMessage[] => {
  const [messages, setMessages] = useState<BridgeMessage[]>([]);

  // Installed in the state initializer so the bridge exists before any child
  // effect reads it, the way the native app injects it before the page loads.
  useState(() => {
    const webkitGlobal = globalThis as WebKitGlobal;
    webkitGlobal.webkit = {
      messageHandlers: Object.fromEntries(
        reviewHandlers.map((handler) => [
          handler,
          {
            postMessage: () =>
              setMessages((current) => [
                ...current,
                { handler, at: new Date().toLocaleTimeString() },
              ]),
          },
        ]),
      ),
    };
    document.documentElement.classList.add('ios');
    return null;
  });

  return messages;
};

const bridgeLabels: Record<string, string> = {
  [WebKitMessageHandlers.ReviewRequest]:
    'review-request: iOS asks StoreKit for the rating pop-up (Apple decides whether it shows)',
  [WebKitMessageHandlers.ReviewOpenStore]:
    'review-open-store: iOS opens the App Store’s Write a Review screen',
};

const BridgeLog = ({
  messages,
}: {
  messages: BridgeMessage[];
}): ReactElement => (
  <div className="flex w-full max-w-[30rem] flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
    <Typography type={TypographyType.Callout} bold>
      Messages posted to the iOS bridge
    </Typography>
    {messages.length === 0 ? (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Nothing yet. The rating pop-up is requested about 2s after the sheet
        opens; the button posts review-open-store.
      </Typography>
    ) : (
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-text-secondary typo-footnote">
        {messages.map((message, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={index}>
            <span className="text-text-quaternary">{message.at} · </span>
            {bridgeLabels[message.handler]}
          </li>
        ))}
      </ol>
    )}
  </div>
);

const Providers = ({
  children,
  isPlus = false,
}: {
  children: ReactNode;
  isPlus?: boolean;
}): ReactElement => {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <BootDataProvider
        app={BootApp.Webapp}
        deviceId="123"
        getPage={fn()}
        getRedirectUri={fn()}
        version="pwa"
        localBootData={getBootMock({
          ...defaultBootData,
          user: { ...defaultUser, isPlus },
        })}
      >
        {/* Modal mounts on production's app root. */}
        <div id="__next">{children}</div>
      </BootDataProvider>
    </QueryClientProvider>
  );
};

const defaultCta: MarketingCta = {
  campaignId: 'storybook-app-store-review',
  createdAt: new Date('2026-11-10T00:00:00.000Z'),
  variant: MarketingCtaVariant.AppStoreReview,
  flags: { title: '', ctaUrl: '', ctaText: '' },
};

// A Customer.io campaign with its own copy and image on the plain sheet.
const campaignCta: MarketingCta = {
  ...defaultCta,
  campaignId: 'storybook-big-release',
  flags: {
    title: 'Thanks for reading the new daily.dev',
    description:
      'If the new version has made your days a little better, a quick rating would mean a lot to us.',
    ctaText: 'Rate daily.dev',
    ctaUrl: '',
    image: cloudinaryGiftedPlusModalImage,
  },
};

// The Plus thank-you after a renewal, on its own variant.
const plusCta: MarketingCta = {
  ...defaultCta,
  campaignId: 'storybook-plus-renewal',
  variant: MarketingCtaVariant.AppStoreReviewPlus,
};

const Sheet = ({
  marketingCta,
}: {
  marketingCta: MarketingCta;
}): ReactElement => {
  const messages = useIOSBridge();
  const isPlus =
    marketingCta.variant === MarketingCtaVariant.AppStoreReviewPlus;
  const ReviewModal = isPlus ? PlusRenewalReviewModal : AppStoreReviewModal;
  // Opened after mount: Modal binds to #__next, which exists once rendered.
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <Providers isPlus={isPlus}>
      <div className="flex min-h-screen flex-col items-center gap-4 bg-background-subtle p-6">
        <BridgeLog messages={messages} />
        {!isOpen && (
          <button
            type="button"
            className="font-bold text-accent-cabbage-default typo-callout hover:underline"
            onClick={() => setIsOpen(true)}
          >
            Open the sheet again
          </button>
        )}
        {isOpen && (
          <ReviewModal
            marketingCta={marketingCta}
            isOpen
            ariaHideApp={false}
            onRequestClose={() => setIsOpen(false)}
          />
        )}
      </div>
    </Providers>
  );
};

const ProfileRow = (): ReactElement => {
  const messages = useIOSBridge();

  return (
    <Providers>
      <div className="flex min-h-screen flex-col items-center gap-6 bg-background-subtle p-6">
        <div className="w-[22.5rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
          <ResourceSection />
        </div>
        <BridgeLog messages={messages} />
      </div>
    </Providers>
  );
};

const meta: Meta = {
  title: 'Growth/App Store reviews/Production',
  id: 'app-store-review-production',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const AskSheet: Story = {
  name: 'Ask sheet (default copy)',
  render: () => <Sheet marketingCta={defaultCta} />,
};

export const CampaignCopy: Story = {
  name: 'Ask sheet (Customer.io copy)',
  render: () => <Sheet marketingCta={campaignCta} />,
};

export const PlusRenewal: Story = {
  name: 'Plus renewal thank-you',
  render: () => <Sheet marketingCta={plusCta} />,
};

export const RateRow: Story = {
  name: 'Profile menu row',
  render: () => <ProfileRow />,
};
