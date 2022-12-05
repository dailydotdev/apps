export const smallPostImage = (url: string): string =>
  url.replace('/f_auto,q_auto/', '/c_fill,f_auto,q_auto,w_192/');

export const cloudinary = {
  feedFilters: {
    recommended:
      'https://daily-now-res.cloudinary.com/image/upload/v1665224467/public/recommended.png',
    yourFeed:
      'https://daily-now-res.cloudinary.com/image/upload/v1667998924/public/your_feed.png',
    supercharge:
      'https://daily-now-res.cloudinary.com/image/upload/v1665563545/public/supercharge.png',
  },
  notifications: {
    browser:
      'https://daily-now-res.cloudinary.com/image/upload/v1670221485/public/notification.png',
  },
};
