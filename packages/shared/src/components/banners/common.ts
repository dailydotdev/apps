import classed from '../../lib/classed';

export const bottomBannerBaseClasses =
  'fixed bottom-0 left-0 z-modal flex w-full flex-row justify-center border-none';

export const BottomBannerContainer = classed('div', bottomBannerBaseClasses);

export const authBannerBg = {
  backgroundImage:
    "url('https://daily-now-res.cloudinary.com/image/upload/s--lf8LUJjq--/f_auto/v1732012913/login-popover-dailydev_mxb7lw')",
  backgroundSize: 'cover',
};

export const authGradientBg =
  'bg-background-default bg-gradient-to-l from-theme-overlay-active-cabbage from-0% to-theme-overlay-active-onion to-100%';
