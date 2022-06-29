export enum ShareProvider {
  Native = 'native',
  CopyLink = 'copy link',
  WhatsApp = 'whatsapp',
  Twitter = 'twitter',
  Facebook = 'facebook',
  Reddit = 'reddit',
  LinkedIn = 'linkedin',
  Telegram = 'telegram',
  Email = 'email',
}

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
export const getRedditShareLink = (link: string, text: string): string =>
  `https://reddit.com/submit?url=${encodeURIComponent(link)}&title=${text}`;
export const getLinkedInShareLink = (link: string): string =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    link,
  )}`;
export const getTelegramShareLink = (link: string, text: string): string =>
  `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
export const getEmailShareLink = (link: string, subject: string): string =>
  `mailto:?subject=${subject}&body=${encodeURIComponent(link)}`;
