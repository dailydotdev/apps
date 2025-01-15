import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { Switch } from '../../fields/Switch';
import type { GdprConsentKey } from '../../../hooks/useCookieBanner';
import { gdprConsentSettings } from '../../../hooks/useCookieBanner';
import { Typography, TypographyColor } from '../../typography/Typography';
import { Accordion } from '../../accordion';
import { getCookies } from '../../../lib/cookie';

interface CookieConsentItemProps {
  consent: GdprConsentKey;
}

const getCookie = (key: GdprConsentKey) => {
  const cookies = getCookies([key]);
  const disabled = globalThis?.localStorage.getItem(key);

  return !!cookies[key] || !disabled;
};

export function CookieConsentItem({
  consent,
}: CookieConsentItemProps): ReactElement {
  const { title, description, isAlwaysOn } = gdprConsentSettings[consent];
  const [isChecked, setIsChecked] = useState<boolean>(
    isAlwaysOn ?? getCookie(consent),
  );

  if (!gdprConsentSettings[consent]) {
    return null;
  }

  return (
    <Accordion
      key={consent}
      title={
        <Switch
          name={consent}
          inputId={consent}
          checked={isChecked}
          onToggle={() => setIsChecked(isAlwaysOn ? true : !isChecked)}
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
