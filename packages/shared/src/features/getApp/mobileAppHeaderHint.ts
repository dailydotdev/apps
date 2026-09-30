import { BOOT_LOCAL_KEY } from '../../contexts/common';
import { tablet } from '../../styles/media';

export const MOBILE_APP_HEADER_HIDDEN_CLASS = 'mobile-app-header-hidden';

// The server renders the logged-out header for everyone so it never shifts
// the page in. This runs in <head> before first paint and hides it for a
// cached member session (or the native apps) until auth settles. It mirrors
// useMobileAppHeader: member = `providers` on the cached user, Android =
// the cached flag or `?android` (as BootProvider reads them), iOS = isIOSNative.
// Tablets and desktops never show the header, so they skip the boot cache.
export const mobileAppHeaderHintScript = `try{var r=document.documentElement;if(!window.matchMedia('${tablet.replace(
  '@media ',
  '',
)}').matches){var b=JSON.parse(localStorage.getItem('${BOOT_LOCAL_KEY}'));if((b&&b.user&&b.user.providers)||(b&&b.isAndroidApp)||new URLSearchParams(location.search).get('android')||(window.webkit&&window.webkit.messageHandlers&&r.classList.contains('ios'))){r.classList.add('${MOBILE_APP_HEADER_HIDDEN_CLASS}')}}}catch(e){}`;
