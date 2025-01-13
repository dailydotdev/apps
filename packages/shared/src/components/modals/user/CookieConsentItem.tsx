import type { ReactElement } from 'react';
import React from 'react';
import { Switch } from '../../fields/Switch';
import type { GdprConsentKey } from '../../../hooks/useCookieBanner';
import { gdprConsentSettings } from '../../../hooks/useCookieBanner';
import { Typography, TypographyColor } from '../../typography/Typography';
import { Accordion } from '../../accordion';

interface CookieConsentItemProps {
  consent: GdprConsentKey;
}

export function CookieConsentItem({
  consent,
}: CookieConsentItemProps): ReactElement {
  if (!gdprConsentSettings[consent]) {
    return null;
  }

  const { title, description, isAlwaysOn } = gdprConsentSettings[consent];

  return (
    <Accordion
      key={consent}
      title={
        <Switch
          name={consent}
          inputId={consent}
          checked={isAlwaysOn ? true : undefined}
        >
          {title}
        </Switch>
      }
    >
      <Typography
        type={Typography.Type.Callout}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </Accordion>
  );
}
