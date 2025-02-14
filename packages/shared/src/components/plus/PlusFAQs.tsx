import type { ReactElement, ReactNode } from 'react';
import React, { useId } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Accordion } from '../accordion';
import { anchorDefaultRel } from '../../lib/strings';
import { faq } from '../../lib/constants';

interface FAQ {
  question: string;
  answer: ReactNode;
}

const plusFAQs = [
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

const FAQItem = ({ item }: { item: FAQ }): ReactElement => (
  <div className="rounded-10 bg-surface-float px-6 py-4">
    <Accordion
      title={
        <Typography
          bold
          color={TypographyColor.Primary}
          tag={TypographyTag.Span}
        >
          {item.question}
        </Typography>
      }
    >
      <Typography
        color={TypographyColor.Tertiary}
        tag={TypographyTag.P}
        type={TypographyType.Callout}
      >
        {item.answer}
      </Typography>
    </Accordion>
  </div>
);

export const PlusFAQs = (): ReactElement => {
  const id = useId();
  const titleId = `${id}-title`;
  return (
    <section aria-labelledby={titleId} className="mt-10 laptop:mt-4">
      <Typography
        bold
        className="mb-10 text-center"
        id={titleId}
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
      >
        Frequently asked questions
      </Typography>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {plusFAQs.map((item) => (
          <FAQItem key={item.question} item={item} />
        ))}
      </div>
      <Typography
        className="mt-10 text-center"
        color={TypographyColor.Tertiary}
        type={TypographyType.Callout}
      >
        For technical or product related questions{' '}
        <a
          className="underline"
          href={faq}
          target="_blank"
          rel={anchorDefaultRel}
        >
          click here
        </a>{' '}
        or email us at{' '}
        <a
          className="underline"
          href="mailto:support@daily.dev?subject=I have a question about Plus membership"
          target="_blank"
          rel={anchorDefaultRel}
        >
          support@daily.dev
        </a>
      </Typography>
    </section>
  );
};
