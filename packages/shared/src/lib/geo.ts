export const geoToEmoji = (geo: string): string => {
  return geo
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 0x1f1a5))
    .join('');
};

const geoWithPrefix = [
  'US',
  'UK',
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
  const country = displayNames.of(geo.toUpperCase());

  if (geoWithPrefix.includes(geo)) {
    return `The ${country}`;
  }

  return country;
};
