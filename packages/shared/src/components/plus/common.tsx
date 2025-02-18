import React from 'react';

export interface CommonPlusPageProps {
  shouldShowPlusHeader?: boolean;
}

export const plusFAQs = [
  {
    question: 'Why should I get the Annual Special Plan now?',
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          The Annual Special Plan is a limited-time offer with the lowest price
          we’ll ever offer for daily.dev Plus. Once it’s gone, it won’t come
          back, and you won’t be able to lock in this discount later.
        </p>
        <p>
          By subscribing now, you keep this discounted rate for as long as you
          stay subscribed, even when new features are added at no extra cost. If
          you cancel and resubscribe later, you may have to pay the regular
          price.
        </p>
        <p>
          If you’re considering upgrading to Plus, now is the best time to
          secure the best deal before the price goes up.
        </p>
      </div>
    ),
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
          us at support@daily.dev. You can learn more about our refund policy
          here.
        </p>
      </div>
    ),
  },
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
    question: 'What happens to my data if I cancel?',
    answer: `Your preferences and bookmarks will stay in your account, but some premium features (like custom feeds, advanced filtering, and bookmark folders) will no longer be accessible.`,
  },
];
