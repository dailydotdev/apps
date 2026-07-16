// Google Cloud "cloud" mark in the four Google brand colors, serialized as a
// data URI on a white square so it reads as a round favicon inside the
// ProfilePicture used by the ad card. Colors are SVG gradient stops, outside
// the `no-custom-color` rule.
const CLOUD_PATH =
  'M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7 .1 5.4 .2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4z';

const avatarSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'><rect width='640' height='640' fill='#ffffff'/><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#4285F4'/><stop offset='.33' stop-color='#EA4335'/><stop offset='.66' stop-color='#FBBC04'/><stop offset='1' stop-color='#34A853'/></linearGradient></defs><g transform='translate(96 150) scale(0.7)'><path d='${CLOUD_PATH}' fill='url(#g)'/></g></svg>`;

export const googleCloudLogoDataUri = `data:image/svg+xml,${encodeURIComponent(
  avatarSvg,
)}`;
