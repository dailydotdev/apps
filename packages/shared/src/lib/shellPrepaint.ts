import { BOOT_LOCAL_KEY } from '../contexts/common';
import type { RemoteSettings } from '../graphql/settings';

// The server cannot know the session or the sidebar state, so prerendered
// HTML would lay the shell out one way and React another once boot lands.
// These attributes on <html> carry that state instead: the inline script
// below writes them from the cached boot before the first paint, MainLayout
// keeps them in sync afterwards, and the shell's laptop CSS reads only them.
//
// `data-shell="header"`: an anonymous web session, which keeps the global
// header instead of the floating card. Absent means the rail owns the header.
export const SHELL_ATTRIBUTE = 'data-shell';
// `data-sidebar="expanded"`: the rail's context panel is open.
export const SIDEBAR_ATTRIBUTE = 'data-sidebar';
// `data-sidebar-density="comfortable"`: the rail shows labels (wider).
export const SIDEBAR_DENSITY_ATTRIBUTE = 'data-sidebar-density';

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
};

export const isPrepaintHeaderShell = (): boolean =>
  globalThis.document?.documentElement.getAttribute(SHELL_ATTRIBUTE) ===
  'header';

// Settings pages force the panel open (`isSidebarSettingsPath`).
export const shellPrepaintScript = `(function(){try{var d=document.documentElement;if(location.pathname.split('/')[1]==='settings')d.setAttribute('${SIDEBAR_ATTRIBUTE}','expanded');var b=JSON.parse(localStorage.getItem('${BOOT_LOCAL_KEY}')||'null');if(!b)return;var u=b.user||{},s=b.settings||{};if(!(u.id&&u.providers))d.setAttribute('${SHELL_ATTRIBUTE}','header');if(s.sidebarExpanded)d.setAttribute('${SIDEBAR_ATTRIBUTE}','expanded');if(s.flags&&s.flags.sidebarCompact===false)d.setAttribute('${SIDEBAR_DENSITY_ATTRIBUTE}','comfortable')}catch(e){}})();`;

// The extension's CSP rules out the inline script, and its new tab always has
// the rail, so its entry applies the sidebar half before the first render.
export const applySidebarPrepaint = (
  settings?: Partial<RemoteSettings>,
): void => {
  if (settings?.sidebarExpanded) {
    setRootAttribute(SIDEBAR_ATTRIBUTE, 'expanded');
  }
  if (settings?.flags?.sidebarCompact === false) {
    setRootAttribute(SIDEBAR_DENSITY_ATTRIBUTE, 'comfortable');
  }
};
