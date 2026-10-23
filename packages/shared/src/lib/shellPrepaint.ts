import type { RemoteSettings } from '../graphql/settings';
import { LAYOUT_VARIANT_COOKIE } from './layoutVariant';

// The server cannot know the session or the sidebar state, so prerendered
// HTML would lay the shell out one way and React another once boot lands.
// These attributes on <html> carry that state instead: the inline script
// below restores them before the first paint from what MainLayout last
// stored, MainLayout keeps them in sync afterwards, and the shell's laptop
// CSS reads only them.
//
// `data-shell="rail"`: a signed-in session (or the extension), where the
// rail owns the header and the content sits in the floating card. Absent
// means the global header, which is also what the server paints.
export const SHELL_ATTRIBUTE = 'data-shell';
// `data-sidebar="expanded"`: the rail's context panel is open.
export const SIDEBAR_ATTRIBUTE = 'data-sidebar';
// `data-sidebar-density="comfortable"`: the rail shows labels (wider).
export const SIDEBAR_DENSITY_ATTRIBUTE = 'data-sidebar-density';

// Space-separated `rail`, `expanded` and `comfortable` tokens, so the script
// reads one short string instead of parsing the boot cache.
export const SHELL_PREPAINT_KEY = 'shell:prepaint';

const attributeTokens: [string, string][] = [
  [SHELL_ATTRIBUTE, 'rail'],
  [SIDEBAR_ATTRIBUTE, 'expanded'],
  [SIDEBAR_DENSITY_ATTRIBUTE, 'comfortable'],
];

export const setRootAttribute = (name: string, value: string | null): void => {
  const root = globalThis.document?.documentElement;

  if (!root) {
    return;
  }

  if (value) {
    root.setAttribute(name, value);
  } else {
    root.removeAttribute(name);
  }

  const tokens = attributeTokens
    .filter(([attribute, token]) => root.getAttribute(attribute) === token)
    .map(([, token]) => token)
    .join(' ');

  try {
    globalThis.localStorage?.setItem(SHELL_PREPAINT_KEY, tokens);
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the
    // shell then settles after boot as it would on a first visit.
  }
};

export const isPrepaintRailShell = (): boolean =>
  globalThis.document?.documentElement.getAttribute(SHELL_ATTRIBUTE) === 'rail';

// Settings pages force the panel open (`isSidebarSettingsPath`). The mirror
// cookie also marks a signed-in laptop session, which covers sessions that
// have not stored a shell yet.
export const shellPrepaintScript = `(function(){var d=document.documentElement;if(location.pathname.split('/')[1]==='settings')d.setAttribute('${SIDEBAR_ATTRIBUTE}','expanded');if((' '+document.cookie).indexOf(' ${LAYOUT_VARIANT_COOKIE}=v2')>-1)d.setAttribute('${SHELL_ATTRIBUTE}','rail');try{var t=' '+(localStorage.getItem('${SHELL_PREPAINT_KEY}')||'')+' ';if(t.indexOf(' rail ')>-1)d.setAttribute('${SHELL_ATTRIBUTE}','rail');if(t.indexOf(' expanded ')>-1)d.setAttribute('${SIDEBAR_ATTRIBUTE}','expanded');if(t.indexOf(' comfortable ')>-1)d.setAttribute('${SIDEBAR_DENSITY_ATTRIBUTE}','comfortable')}catch(e){}})();`;

// The extension's CSP rules out the inline script, and its new tab always has
// the rail, so its entry applies the attributes before the first render.
export const applyExtensionShellPrepaint = (
  settings?: Partial<RemoteSettings>,
): void => {
  setRootAttribute(SHELL_ATTRIBUTE, 'rail');
  if (settings?.sidebarExpanded) {
    setRootAttribute(SIDEBAR_ATTRIBUTE, 'expanded');
  }
  if (settings?.flags?.sidebarCompact === false) {
    setRootAttribute(SIDEBAR_DENSITY_ATTRIBUTE, 'comfortable');
  }
};
