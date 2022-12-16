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
    topicsV2:
      'https://daily-now-res.cloudinary.com/image/upload/v1670321759/public/feed_filters_v2.svg',
    topicsV3:
      'https://daily-now-res.cloudinary.com/image/upload/v1670321759/public/feed_filters_v3.svg',
    scroll:
      'https://daily-now-res.cloudinary.com/image/upload/v1671199935/public/scroll_feed_filters.svg',
  },
};
