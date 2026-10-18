/**
 * Rasterises a rendered card into a PNG in the browser, with no library.
 *
 * The frame is cloned, every element gets its computed style inlined (which
 * turns container units into resolved pixels), every <img> is swapped for a
 * data URL so the SVG can carry it, and the whole thing is drawn through an
 * SVG foreignObject onto a canvas at the requested scale. Good enough for a
 * design review and for testing the share flow; the shipped renderer is
 * server-side.
 */

const SKIP_PROPS = new Set(['cursor', 'pointer-events', 'user-select']);

const inlineStyles = (source: Element, target: Element): void => {
  if (source instanceof HTMLElement || source instanceof SVGElement) {
    const computed = window.getComputedStyle(source);
    const style = (target as HTMLElement).style;
    for (let index = 0; index < computed.length; index += 1) {
      const prop = computed[index];
      if (!SKIP_PROPS.has(prop)) {
        style.setProperty(prop, computed.getPropertyValue(prop), computed.getPropertyPriority(prop));
      }
    }
    const before = window.getComputedStyle(source, '::before');
    if (before.content && before.content !== 'none' && before.content !== 'normal') {
      target.setAttribute('data-snapshot-before', before.content);
    }
  }
  const sourceKids = Array.from(source.children);
  const targetKids = Array.from(target.children);
  sourceKids.forEach((kid, index) => {
    if (targetKids[index]) {
      inlineStyles(kid, targetKids[index]);
    }
  });
};

/**
 * github.com/<login>.png redirects without CORS headers; the avatar host it
 * redirects to serves them. Everything else is fetched as is.
 */
const corsFriendly = (url: string): string => {
  const github = url.match(/^https?:\/\/github\.com\/([^./?]+)\.png(?:\?size=(\d+))?/);
  return github
    ? `https://avatars.githubusercontent.com/${github[1]}?size=${github[2] ?? 128}`
    : url;
};

const toDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(corsFriendly(url), { mode: 'cors', cache: 'force-cache' });
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const inlineImages = async (root: Element): Promise<void> => {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('data:')) {
        return;
      }
      try {
        img.setAttribute('src', await toDataUrl(src));
      } catch {
        img.remove();
      }
    }),
  );

  const svgImages = Array.from(root.querySelectorAll('image'));
  await Promise.all(
    svgImages.map(async (node) => {
      const href = node.getAttribute('href') ?? node.getAttribute('xlink:href');
      if (!href || href.startsWith('data:')) {
        return;
      }
      try {
        const data = await toDataUrl(href);
        node.setAttribute('href', data);
        node.removeAttribute('xlink:href');
      } catch {
        node.remove();
      }
    }),
  );

  const URL_PROPS = ['background-image', 'mask-image', '-webkit-mask-image', 'border-image-source'];
  const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))] as HTMLElement[];
  all.forEach((node) => {
    Array.from(node.style ?? []).forEach((prop) => {
      if (prop.startsWith('--') && /url\(/.test(node.style.getPropertyValue(prop))) {
        node.style.removeProperty(prop);
      }
    });
  });
  await Promise.all(
    all.flatMap((node) =>
      URL_PROPS.map(async (prop) => {
        const value = node.style?.getPropertyValue(prop);
        if (!value || !/url\(["']?https?:/.test(value)) {
          return;
        }
        const urls = Array.from(value.matchAll(/url\(["']?(https?:[^"')]+)["']?\)/g)).map((m) => m[1]);
        let next = value;
        for (const url of urls) {
          try {
            next = next.replace(url, await toDataUrl(url));
          } catch {
            next = next.replace(/url\(["']?https?:[^"')]+["']?\)/, 'none');
          }
        }
        node.style.setProperty(prop, next);
      }),
    ),
  );
};

export interface SnapshotOptions {
  scale?: number;
  /** Override the captured box, e.g. to shoot the frame inside a scaled thumbnail at authoring size. */
  width?: number;
  height?: number;
}

export const snapshotElement = async (
  element: HTMLElement,
  { scale = 2, width, height }: SnapshotOptions = {},
): Promise<Blob> => {
  const w = Math.ceil(width ?? element.offsetWidth);
  const h = Math.ceil(height ?? element.offsetHeight);

  const clone = element.cloneNode(true) as HTMLElement;
  inlineStyles(element, clone);
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.position = 'static';
  clone.style.width = `${w}px`;
  clone.style.height = `${h}px`;
  await inlineImages(clone);

  const markup = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${markup}</div></foreignObject></svg>`;
  // A blob: URL taints the canvas in Chromium once foreignObject is involved; a data: URL does not.
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('snapshot: could not rasterise the card'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('snapshot: no canvas context');
    }
    context.scale(scale, scale);
    context.drawImage(image, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('snapshot: empty blob'))), 'image/png');
    });
  }
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const copyBlob = async (blob: Blob): Promise<boolean> => {
  try {
    if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
      return false;
    }
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch {
    return false;
  }
};

/** The frame inside any wrapper: the thumbnail scales it, the snapshot wants it at authoring size. */
export const frameIn = (container: HTMLElement | null): HTMLElement | null =>
  container?.querySelector<HTMLElement>('.is-top .rp-frame') ??
  container?.querySelector<HTMLElement>('.rp-frame') ??
  null;
