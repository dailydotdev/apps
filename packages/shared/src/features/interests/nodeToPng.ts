/**
 * A rendered element, as a picture of itself.
 *
 * The element is cloned, every computed style is written onto the clone as an
 * inline one, and the result is handed to the renderer inside an SVG
 * `foreignObject`. That is what makes the copy match the screen: it is the same
 * layout, the same tokens and the same type, not a second drawing of them.
 *
 * No library, for the reason a reviewer already gave about a different one: this
 * is `shared`, so anything added here also ships in the extension. It is ~60
 * lines because the card it has to photograph is plain — text, inline SVG and
 * gradients. It is not a general-purpose rasteriser and should not become one.
 *
 * Two things it cannot do, both avoided by how the card is built rather than by
 * code here: pseudo-elements are not cloned, so the card's glow is a real
 * element; and an SVG image cannot reach the page's webfonts, which is only
 * survivable because the app's stack is system faces.
 */
const inline = (source: Element, clone: Element): void => {
  const computed = getComputedStyle(source);
  let css = '';

  for (let index = 0; index < computed.length; index += 1) {
    const property = computed.item(index);

    css += `${property}:${computed.getPropertyValue(property)};`;
  }

  clone.setAttribute('style', css);

  const sources = Array.from(source.children);
  const clones = Array.from(clone.children);

  sources.forEach((child, index) => {
    const pair = clones[index];

    if (pair) {
      inline(child, pair);
    }
  });
};

export const nodeToPng = async (
  node: HTMLElement,
  /** 2 so the picture holds up on the screen it gets pasted onto. */
  scale = 2,
): Promise<Blob> => {
  const { width, height } = node.getBoundingClientRect();
  const clone = node.cloneNode(true) as HTMLElement;

  inline(node, clone);

  // The clone is measured, not laid out by its parent, so it has to carry the
  // box it had on screen.
  clone.style.margin = '0';
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;

  const markup = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject x="0" y="0" width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${markup}</div></foreignObject></svg>`;

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('nodeToPng: rasterising needs a 2d context');
  }

  ctx.scale(scale, scale);
  ctx.drawImage(image, 0, 0);

  const blob = await new Promise<Blob | null>((done) =>
    canvas.toBlob(done, 'image/png'),
  );

  if (!blob) {
    throw new Error('nodeToPng: the canvas produced no image');
  }

  return blob;
};
