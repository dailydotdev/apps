import { BOOT_LOCAL_KEY } from '../../contexts/common';
import { tablet } from '../../styles/media';

export const MOBILE_APP_HEADER_HIDDEN_CLASS = 'mobile-app-header-hidden';

// Plain ES5 for an inline <head> script. Each check mirrors one condition of
// useMobileAppHeader/usePhoneBrowser; mobileAppHeaderHint.spec keeps them in
// step.
const isTabletUp = `matchMedia('${tablet.replace('@media ', '')}').matches`;
const isAndroidLaunch = `new URLSearchParams(location.search).get('android')`;
const isIOSNative = `(window.webkit&&window.webkit.messageHandlers&&r.classList.contains('ios'))`;
const isPWA = `(navigator.standalone||matchMedia('(display-mode: standalone)').matches)`;
const readBootCache = `JSON.parse(localStorage.getItem('${BOOT_LOCAL_KEY}'))||{}`;
const isCachedMemberOrAndroid = `(b.user&&b.user.providers)||b.isAndroidApp`;

// The server renders the logged-out header for everyone so it never shifts
// the page in. This runs before first paint and hides it for a cached member
// session, the native apps and installed PWAs until auth settles. Tablets and
// desktops never show it, so they skip the boot cache.
export const mobileAppHeaderHintScript = `try{var r=document.documentElement;if(!${isTabletUp}){var b;if(${isAndroidLaunch}||${isIOSNative}||${isPWA}||(b=${readBootCache},${isCachedMemberOrAndroid})){r.classList.add('${MOBILE_APP_HEADER_HIDDEN_CLASS}')}}}catch(e){}`;
