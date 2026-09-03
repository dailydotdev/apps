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

/**
 * Where Google requires a certified CMP (TCF): the EEA, the UK and
 * Switzerland. Country codes rather than a continent, because the EU's
 * outermost regions carry their own ISO codes on other continents (Réunion
 * and Mayotte resolve to Africa, the Caribbean territories to the Americas)
 * while continental Europe includes plenty of countries the mandate does not
 * cover.
 */
const CERTIFIED_CMP_COUNTRIES = new Set([
  // EU
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
  // EEA outside the EU
  'IS',
  'LI',
  'NO',
  // UK and Switzerland
  'GB',
  'CH',
  // EU member-state territories with their own ISO codes
  'AX',
  'GF',
  'GP',
  'MQ',
  'RE',
  'YT',
  'BL',
  'MF',
  'PM',
]);

/** Unknown geo counts as covered: erring safe means asking, not serving. */
export const requiresCertifiedCmp = (region?: string): boolean =>
  !region || CERTIFIED_CMP_COUNTRIES.has(region.toUpperCase());
