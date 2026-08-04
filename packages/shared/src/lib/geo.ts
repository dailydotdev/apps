export const geoToEmoji = (geo: string): string => {
  return geo
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 0x1f1a5))
    .join('');
};

const geoWithPrefix = [
  'US',
  'GB',
  'UAE',
  'NL',
  'PH',
  'BS',
  'MV',
  'GM',
  'CD',
  'CG',
];

export const geoToCountry = (geo: string): string => {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  const normalizedGeo = geo.toUpperCase();
  const country = displayNames.of(normalizedGeo);
  if (!country) {
    return normalizedGeo;
  }

  if (geoWithPrefix.includes(normalizedGeo)) {
    return `The ${country}`;
  }

  return country;
};

export enum Continent {
  Africa = 'AF',
  Antarctica = 'AN',
  Asia = 'AS',
  Europe = 'EU',
  Oceania = 'OC',
  NorthAmerica = 'NA',
  SouthAmerica = 'SA',
}

export const outsideGdpr = ['US', 'IL'];

// IAB TCF scope: EU-27 + EEA (IS/LI/NO) + UK + CH. Gates the iubenda CMP
// (TCF banner) only — broader GDPR-style gating (pixels, homegrown banner)
// stays on `outsideGdpr`.
export const tcfRegions = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  'IS',
  'LI',
  'NO',
  'GB',
  'CH',
];
