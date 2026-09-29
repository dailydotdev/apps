import { BOOT_LOCAL_KEY } from '../../contexts/common';

export const MOBILE_APP_HEADER_HIDDEN_CLASS = 'mobile-app-header-hidden';

// The server renders the logged-out header for everyone so it never shifts
// the page in. This runs in <head> before first paint and hides it for a
// cached member session (or the native apps) until auth settles.
export const mobileAppHeaderHintScript = `try{var b=JSON.parse(localStorage.getItem('${BOOT_LOCAL_KEY}'));var r=document.documentElement;if((b&&b.user&&b.user.providers)||(b&&b.isAndroidApp)||(window.webkit&&window.webkit.messageHandlers&&r.classList.contains('ios'))){r.classList.add('${MOBILE_APP_HEADER_HIDDEN_CLASS}')}}catch(e){}`;
