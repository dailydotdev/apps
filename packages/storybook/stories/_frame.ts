// A blank iframe that looks like this document: its styles and theme, for
// stories that render into a frame of their own so media queries see the
// frame's width. Shared by the design explorations that need one.

let sharedStyles: string | undefined;

/**
 * This document's styles as one stylesheet URL, rebuilt when they change.
 * The old URL stays valid for frames still loading it.
 */
const stylesUrl = (): string => {
  if (!sharedStyles) {
    const css = [...document.head.querySelectorAll('style')]
      .map((node) => node.textContent)
      .join('\n');
    const url = URL.createObjectURL(new Blob([css], { type: 'text/css' }));
    const isStyle = (node: Node): boolean =>
      (node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode)
        ?.nodeName === 'STYLE';
    const observer = new MutationObserver((mutations) => {
      if (
        !mutations.some(
          (mutation) =>
            isStyle(mutation.target) ||
            [...mutation.addedNodes, ...mutation.removedNodes].some(isStyle),
        )
      ) {
        return;
      }
      observer.disconnect();
      sharedStyles = undefined;
    });
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    sharedStyles = url;
  }
  return sharedStyles;
};

/**
 * Gives a blank frame this document's styles and theme. Every frame links
 * the same stylesheet, so the browser parses it once for all of them.
 */
export const mountFrame = (doc: Document): (() => void) => {
  doc.open();
  doc.write('<!doctype html><html><head></head><body></body></html>');
  doc.close();
  doc.documentElement.className = document.documentElement.className;
  document.head
    .querySelectorAll('link[rel="stylesheet"]')
    .forEach((node) => doc.head.appendChild(node.cloneNode(true)));
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = stylesUrl();
  doc.body.className = 'bg-background-default text-text-primary';
  doc.body.style.margin = '0';
  // Hidden until the stylesheet applies, so nothing paints unstyled.
  doc.body.style.visibility = 'hidden';
  const show = () => {
    doc.body.style.visibility = '';
  };
  link.addEventListener('load', show);
  link.addEventListener('error', show);
  doc.head.appendChild(link);

  const theme = new MutationObserver(() => {
    doc.documentElement.className = document.documentElement.className;
  });
  theme.observe(document.documentElement, { attributes: true });
  return () => theme.disconnect();
};
