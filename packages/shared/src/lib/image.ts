export const cloudinary = {
  post: {
    imageCoverPlaceholder:
      'https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1',
  },
  feedFilters: {
    recommended:
      'https://daily-now-res.cloudinary.com/image/upload/v1665224467/public/recommended.png',
    yourFeed: {
      dark: 'https://daily-now-res.cloudinary.com/image/upload/s--_0r3L1f9--/v1689662930/Your_feed_dark_ord3s0.png',
      light:
        'https://daily-now-res.cloudinary.com/image/upload/s--n6DmR1cJ--/v1689662930/Your_feed_light_iyrsva.png',
    },
    topicsV2:
      'https://daily-now-res.cloudinary.com/image/upload/v1670321759/public/feed_filters_v2.svg',
    topicsV3:
      'https://daily-now-res.cloudinary.com/image/upload/v1670321759/public/feed_filters_v3.svg',
    scroll: {
      dark: 'https://daily-now-res.cloudinary.com/image/upload/v1671199935/public/scroll_feed_filters.svg',
      light:
        'https://daily-now-res.cloudinary.com/image/upload/v1687252879/Categories-WV_dhrdcy.svg',
    },
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
    createSquad:
      'https://daily-now-res.cloudinary.com/image/upload/v1679320203/public/create_squad.png',
    tour: {
      banner0:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour0',
      banner1:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour1',
      banner1_v2:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour1_v2',
      banner2:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour2',
      banner3:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour3',
      banner4:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour4',
      banner4_v2:
        'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/squad_tour4_v2',
    },
    promotion: {
      settings:
        'https://daily-now-res.cloudinary.com/image/upload/s--t2gh6NPn--/f_auto/v1686119165/Customize_squad_settings_nepkhd',
      remove:
        'https://daily-now-res.cloudinary.com/image/upload/s--Eux3awhS--/f_auto/v1686120942/Remove_squad_members_jukf7z',
      delete:
        'https://daily-now-res.cloudinary.com/image/upload/s--wXug6Yop--/f_auto/v1686119164/Remove_posts_and_comments_pu3zjj',
      banner:
        'https://daily-now-res.cloudinary.com/image/upload/s--6v3E8go1--/f_auto/v1686119164/promoted-bg_k9jzgt',
      invite:
        'https://daily-now-res.cloudinary.com/image/upload/s--d3OMbTzl--/f_auto/v1686119165/Grow_your_squad_wtlbof',
      promote:
        'https://daily-now-res.cloudinary.com/image/upload/s--iMFoS7Pd--/f_auto/v1686119165/Manage_roles_and_permissions_om64cu',
    },
    emptySquad:
      'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/empty-squad',
    emptySquadLight:
      'https://daily-now-res.cloudinary.com/image/upload/f_auto/public/empty_squad_light',
  },
  referralCampaign: {
    appScreenshot:
      'https://daily-now-res.cloudinary.com/image/upload/s--3e8Phst3--/f_auto,q_auto/v1686045256/daily_lmzdaf',
    backgroundDark:
      'https://daily-now-res.cloudinary.com/image/upload/s--YzB9MTQz--/v1686039108/main-background_ciqmr7.svg',
    purpleEdgeGlow:
      'https://daily-now-res.cloudinary.com/image/upload/s--Va9xODJM--/v1686074969/Glow_fjelt5.svg',
  },
};

export const smallPostImage = (url: string): string => {
  if (!url) {
    return cloudinary.post.imageCoverPlaceholder;
  }

  return url.replace('/f_auto,q_auto/', '/c_fill,f_auto,q_auto,w_192/');
};
