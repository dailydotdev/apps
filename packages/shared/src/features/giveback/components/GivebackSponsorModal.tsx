import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useGivebackContext } from '../GivebackContext';
import { GivebackSponsorType } from '../types';
import {
  formatDonationAmount,
  getSponsorTier,
  sponsorTierLabel,
} from '../utils';

interface GivebackSponsorModalProps {
  onClose: () => void;
}

const sponsorTypes: { id: GivebackSponsorType; label: string }[] = [
  { id: GivebackSponsorType.Company, label: 'A company' },
  { id: GivebackSponsorType.Individual, label: 'An individual' },
];

const amountPresets = [100, 250, 500, 1000, 5000];

export const GivebackSponsorModal = ({
  onClose,
}: GivebackSponsorModalProps): ReactElement => {
  const { campaign, sponsorCampaign } = useGivebackContext();
  const { displayToast } = useToastNotification();
  const [type, setType] = useState<GivebackSponsorType>(
    GivebackSponsorType.Company,
  );
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(1000);
  const [message, setMessage] = useState('');

  const isCompany = type === GivebackSponsorType.Company;
  const canSubmit = name.trim().length > 0 && amount > 0;

  const onSubmit = () => {
    if (!canSubmit) {
      return;
    }
    sponsorCampaign({ name, type, amount, message });
    displayToast(
      `Thank you! ${formatDonationAmount(
        amount,
        campaign.currency,
      )} added to the pot.`,
    );
    onClose();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-modal flex items-center justify-center bg-overlay-primary-pepper px-4 backdrop-blur-sm"
    >
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="giveback-sponsor-title"
        className="relative flex w-full max-w-[34rem] flex-col overflow-hidden rounded-24 border border-border-subtlest-secondary bg-background-default shadow-2"
      >
        <div
          aria-hidden
          className="bg-accent-cabbage-default/20 pointer-events-none absolute -right-20 -top-20 size-56 rounded-full blur-3xl"
        />

        <FlexCol className="relative gap-2 p-5 pb-3 tablet:px-6 tablet:pt-6">
          <Typography
            bold
            id="giveback-sponsor-title"
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
          >
            Sponsor the campaign
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Top up the budget directly. Every dollar you add goes straight to
            the causes. daily.dev covers the platform.
          </Typography>
        </FlexCol>

        <FlexCol className="relative gap-4 px-5 py-3 tablet:px-6">
          <FlexCol className="gap-2">
            <Typography bold type={TypographyType.Footnote}>
              I&apos;m sponsoring as
            </Typography>
            <FlexRow className="gap-2">
              {sponsorTypes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setType(option.id)}
                  aria-pressed={type === option.id}
                  className={classNames(
                    'flex-1 rounded-12 border px-3 py-2 text-center font-bold transition-colors typo-callout',
                    type === option.id
                      ? 'border-accent-cabbage-default bg-accent-cabbage-flat text-accent-cabbage-default'
                      : 'border-border-subtlest-tertiary text-text-tertiary hover:text-text-primary',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </FlexRow>
          </FlexCol>

          <label
            htmlFor="giveback-sponsor-name"
            className="flex flex-col gap-2"
          >
            <Typography bold type={TypographyType.Footnote}>
              {isCompany ? 'Company name' : 'Your name'}
            </Typography>
            <input
              id="giveback-sponsor-name"
              className="rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
              placeholder={isCompany ? 'Acme Inc.' : 'Jane Developer'}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <FlexCol className="gap-2">
            <Typography bold type={TypographyType.Footnote}>
              Amount
            </Typography>
            <FlexRow className="flex-wrap gap-2">
              {amountPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  aria-pressed={amount === preset}
                  className={classNames(
                    'rounded-10 border px-3 py-1.5 font-bold tabular-nums transition-colors typo-footnote',
                    amount === preset
                      ? 'border-accent-cabbage-default bg-accent-cabbage-flat text-accent-cabbage-default'
                      : 'border-border-subtlest-tertiary text-text-tertiary hover:text-text-primary',
                  )}
                >
                  {formatDonationAmount(preset, campaign.currency)}
                </button>
              ))}
            </FlexRow>
            <FlexRow className="items-center gap-2">
              <span className="text-text-tertiary typo-callout">
                {campaign.currency === 'USD' ? '$' : campaign.currency}
              </span>
              <input
                id="giveback-sponsor-amount"
                type="number"
                min={1}
                aria-label="Custom amount"
                className="w-32 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
                value={amount}
                onChange={(event) =>
                  setAmount(Math.max(0, Math.floor(Number(event.target.value))))
                }
              />
              {amount > 0 && (
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  {sponsorTierLabel[getSponsorTier(amount)]} sponsor
                </Typography>
              )}
            </FlexRow>
          </FlexCol>

          <label
            htmlFor="giveback-sponsor-message"
            className="flex flex-col gap-2"
          >
            <FlexRow className="items-center gap-2">
              <Typography bold type={TypographyType.Footnote}>
                Message
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                optional
              </Typography>
            </FlexRow>
            <textarea
              id="giveback-sponsor-message"
              className="min-h-20 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
              placeholder="Why are you backing this?"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
        </FlexCol>

        <FlexRow className="items-center justify-between gap-2 border-t border-border-subtlest-tertiary p-4 tablet:px-6">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Demo only. No payment is taken.
          </Typography>
          <FlexRow className="items-center gap-2">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              disabled={!canSubmit}
              onClick={onSubmit}
            >
              Add {formatDonationAmount(amount, campaign.currency)}
            </Button>
          </FlexRow>
        </FlexRow>
      </section>
    </div>
  );
};
