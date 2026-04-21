import React from 'react';
import { feedback } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

export interface CommonPlusPageProps {
  shouldShowPlusHeader?: boolean;
}

type FAQItem = {
  question: string;
  answer: React.ReactNode;
};

export const plusFAQItemsControl: FAQItem[] = [
  {
    question: 'Can I use my Plus membership on multiple devices?',
    answer: `Yes! Your Plus benefits are tied to your account, so you can use them across all your devices (desktop, mobile, or tablet) just by logging in.`,
  },
  {
    question: 'How does billing work?',
    answer: `We offer monthly and yearly plans. Your subscription automatically renews, but you can cancel anytime before your next billing cycle.`,
  },
  {
    question: 'What forms of payment do you accept?',
    answer: `We accept all major credit and debit cards, as well as PayPal, Apple Pay, and Google Pay. Payments are securely processed through Paddle, our payment provider. Additional local payment methods may be available in some countries.`,
  },
  {
    question: 'Can I cancel anytime?',
    answer: `Yes! You can cancel your subscription at any time, and your Plus benefits will remain active until the end of your billing cycle.`,
  },
  {
    question: 'Can I get a refund if I didn’t like it?',
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          Absolutely. If daily.dev Plus isn’t for you, we offer a 30-day
          hassle-free refund, no questions asked.
        </p>
        <p>
          To get a refund, please first cancel your subscription and then email
          us at support@daily.dev. You can learn more about our refund policy{' '}
          <a
            className="underline"
            href={feedback}
            target="_blank"
            rel={anchorDefaultRel}
          >
            here
          </a>
          .
        </p>
      </div>
    ),
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: `Your preferences and bookmarks will stay in your account, but some premium features (like custom feeds, advanced filtering, and bookmark folders) will no longer be accessible.`,
  },
];

const apiFAQItems: FAQItem[] = [
  {
    question: 'What can I build with the API?',
    answer: `Coding agents, Slack bots, dashboards, personalized digests, anything that needs a feed of what developers are actually reading. Check the API docs for available endpoints and pre-built integrations with Claude Code, Cursor, and Codex.`,
  },
  {
    question: 'What endpoints does the API have?',
    answer: `Personalized feed, search, post details, bookmarks. Full OpenAPI spec at api.daily.dev/public/v1/docs/json.`,
  },
  {
    question: 'How does authentication work?',
    answer: `You create personal access tokens from your account settings after subscribing. Pick an expiration (30 days, 90 days, 1 year, or never) and use it as a Bearer token.`,
  },
  {
    question: 'Are there usage limits?',
    answer: `There are rate limits designed for personal use and small integrations. If you're planning something heavier, email support@daily.dev and we'll figure it out together.`,
  },
];

export const plusFAQItemsApi: FAQItem[] = [
  ...apiFAQItems,
  ...plusFAQItemsControl,
];
