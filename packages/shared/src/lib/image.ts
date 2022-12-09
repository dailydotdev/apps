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
      'https://daily-now-res.cloudinary.com/image/upload/v1670512489/public/notification_animated.gif',
    upvote:
      'https://daily-now-res.cloudinary.com/image/upload/v1670251800/notifications/icons/upvote.svg',
    daily:
      'https://daily-now-res.cloudinary.com/image/upload/v1670251800/notifications/icons/daily.svg',
    discuss:
      'https://daily-now-res.cloudinary.com/image/upload/v1670251800/notifications/icons/discuss.svg',
    bell: 'https://daily-now-res.cloudinary.com/image/upload/v1670251800/notifications/icons/bell.svg',
  },
};
