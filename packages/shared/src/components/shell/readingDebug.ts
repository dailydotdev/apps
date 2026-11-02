// TEMP-DEBUG: on-screen readout of the drawer's scroll state for the
// simulator and the device, where the web inspector is out of reach.
// Never ships: lives on the combined preview branch only.
type DebugWindow = typeof globalThis & {
  __readingDebug?: Record<string, unknown>;
  __readingLog?: (line: string) => void;
};

const lines: string[] = [];
let panel: HTMLPreElement | null = null;
let frame = 0;

export const readingLog = (line: string): void => {
  const at = (performance.now() / 1000).toFixed(2);
  lines.push(`${at} ${line} sy=${Math.round(window.scrollY)}`);
  if (lines.length > 14) {
    lines.shift();
  }
};

const render = () => {
  frame = requestAnimationFrame(render);
  if (!panel) {
    return;
  }
  const root = document.documentElement;
  const state = (globalThis as DebugWindow).__readingDebug ?? {};
  const vv = window.visualViewport;
  panel.textContent = [
    `sy=${Math.round(window.scrollY)} docH=${root.scrollHeight} ih=${window.innerHeight} vv=${vv ? `${Math.round(vv.pageTop)}/${Math.round(vv.height)}` : '-'}`,
    `pad=${getComputedStyle(document.body).paddingTop} cls=${root.className.replace('js-focus-visible', '').trim()}`,
    `state=${JSON.stringify(state)}`,
    ...lines,
  ].join('\n');
};

export const installReadingDebug = (): (() => void) => {
  const w = globalThis as DebugWindow;
  w.__readingLog = readingLog;
  if (!panel) {
    panel = document.createElement('pre');
    panel.setAttribute('aria-hidden', 'true');
    panel.style.cssText =
      'position:fixed;left:0;right:0;top:40%;z-index:2147483647;margin:0;padding:4px 6px;font:9px/1.25 Menlo,monospace;color:#0f0;background:rgba(0,0,0,.72);pointer-events:none;white-space:pre-wrap;word-break:break-all;max-height:55%;overflow:hidden';
    document.body.appendChild(panel);
    window.addEventListener('scroll', () => readingLog('scroll'), {
      passive: true,
    });
    render();
  }
  return () => {
    cancelAnimationFrame(frame);
    panel?.remove();
    panel = null;
  };
};
