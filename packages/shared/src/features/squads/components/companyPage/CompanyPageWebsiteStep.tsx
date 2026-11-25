import type { FormEvent, ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { TextField } from '../../../../components/fields/TextField';
import { LinkIcon } from '../../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { parseHttpUrl } from '../../../../lib/links';
import {
  CheckoutCta,
  CheckoutShell,
  CheckoutStage,
  CheckoutTitle,
} from '../checkout/CheckoutShell';
import { StartupsNameStunt } from '../checkout/StartupsNameStunt';

const FORM_ID = 'company-page-website-form';

// "app.acme.dev" spells ACME in the stadium while the founder types
export const getWebsiteName = (website: string): string => {
  const url = parseHttpUrl(website.trim());
  if (!url) {
    return '';
  }

  const labels = new URL(url).hostname.replace(/^www\./, '').split('.');
  return (
    labels
      .slice(0, -1)
      .sort((a, b) => b.length - a.length)[0]
      ?.replace(/[^a-z0-9]/gi, '') ?? ''
  );
};

interface CompanyPageWebsiteStepProps {
  website: string;
  onWebsiteChange: (website: string) => void;
  onSubmit: (website: string) => void;
  /** No website yet: the form, filled in by hand. */
  onFillManually: () => void;
  isLoading?: boolean;
  error?: string;
}

/** The whole top of the funnel: one box for the founder's website. */
export const CompanyPageWebsiteStep = ({
  website,
  onWebsiteChange,
  onSubmit,
  onFillManually,
  isLoading,
  error,
}: CompanyPageWebsiteStepProps): ReactElement => {
  const url = website.trim() ? parseHttpUrl(website.trim()) : null;
  const isInvalid = !!website.trim() && !url;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (url && !isLoading) {
      onSubmit(url);
    }
  };

  return (
    <CheckoutShell
      current={CheckoutStage.Company}
      aside={<StartupsNameStunt name={getWebsiteName(website)} />}
    >
      <CheckoutTitle
        title="Create your free company page"
        description="Enter your website and we'll set up the page for you."
      />
      <form
        id={FORM_ID}
        className="flex w-full flex-col gap-6"
        onSubmit={submit}
        noValidate
      >
        <TextField
          label="Your website"
          placeholder="yourcompany.com"
          inputId="website"
          name="website"
          inputMode="url"
          autoComplete="url"
          autoFocus
          leftIcon={<LinkIcon />}
          value={website}
          valueChanged={onWebsiteChange}
          valid={isInvalid || error ? false : undefined}
          hint={
            error ??
            (isInvalid ? 'Enter a website like yourcompany.com' : undefined)
          }
          className={{ container: 'w-full' }}
        />
        <CheckoutCta>
          <Button
            type="submit"
            variant={ButtonVariant.Primary}
            className="flex-1"
            loading={isLoading}
            disabled={!url || isLoading}
          >
            Create my page
          </Button>
        </CheckoutCta>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          No website yet?{' '}
          <button
            type="button"
            className="text-text-link underline"
            onClick={onFillManually}
          >
            Fill it in yourself
          </button>
        </Typography>
      </form>
    </CheckoutShell>
  );
};
