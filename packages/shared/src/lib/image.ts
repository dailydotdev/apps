export const smallPostImage = (url: string): string =>
  url.replace('/f_auto,q_auto/', '/c_fill,f_auto,q_auto,w_192/');

export const cloudinary = {
  post: {
    imageCoverPlaceholder:
      'https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1',
  },
  feedFilters: {
    recommended:
      'https://daily-now-res.cloudinary.com/image/upload/v1665224467/public/recommended.png',
    yourFeed:
      'https://daily-now-res.cloudinary.com/image/upload/v1667998924/public/your_feed.png',
    topicsV2:
      'https://daily-now-res.cloudinary.com/image/upload/v1670321759/public/feed_filters_v2.svg',
    topicsV3:
      'https://daily-now-res.cloudinary.com/image/upload/v1670321759/public/feed_filters_v3.svg',
    scroll:
      'https://daily-now-res.cloudinary.com/image/upload/v1671199935/public/scroll_feed_filters.svg',
  },
  notifications: {
    big: 'https://daily-now-res.cloudinary.com/image/upload/public/notification_big.svg',
    browser:
      'https://daily-now-res.cloudinary.com/image/upload/v1670512489/public/notification_animated.gif',
    browser_enabled:
      'https://daily-now-res.cloudinary.com/image/upload/v1672124926/public/notifications_enabled.gif',
    upvote:
      'https://daily-now-res.cloudinary.com/image/upload/v1670251800/notifications/icons/upvote.svg',
    daily:
      'https://daily-now-res.cloudinary.com/image/upload/v1670251800/notifications/icons/daily.svg',
    discuss:
      'https://daily-now-res.cloudinary.com/image/upload/v1670251800/notifications/icons/discuss.svg',
    bell: 'https://daily-now-res.cloudinary.com/image/upload/v1670251800/notifications/icons/bell.svg',
  },
  squads: {
    imageFallback:
      'https://daily-now-res.cloudinary.com/image/upload/v1672041320/squads/squad_placeholder.jpg',
    tour: {
      banner0:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour0',
      banner1:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour1',
      banner2:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour2',
      banner3:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour3',
      banner4:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour4',
    },
  },
};
