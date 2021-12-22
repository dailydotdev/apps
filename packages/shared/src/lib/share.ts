export const getShareableLink = (): string => {
  try {
    return window.location.href.split('?')[0];
  } catch (ex) {
    return '';
  }
};
export const getWhatsappShareLink = (link: string): string =>
  `https://wa.me/?text=${encodeURIComponent(link)}`;
export const getTwitterShareLink = (link: string, text: string): string =>
  `http://twitter.com/share?url=${encodeURIComponent(
    link,
  )}&text=${encodeURIComponent(`${text} via @dailydotdev`)}`;
export const getFacebookShareLink = (link: string): string =>
  `https://www.facebook.com/sharer/sharer.php?display=page&u=${encodeURIComponent(
    link,
  )}`;
