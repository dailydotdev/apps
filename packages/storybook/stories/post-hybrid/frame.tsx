import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
// @ts-expect-error react-dom ships no types in this package
import { createRoot } from 'react-dom/client';

/**
 * A device of its own width: a blank frame the page renders straight into,
 * with this document's styles and theme copied in, so Tailwind's
 * breakpoints apply as they would live. Same approach as the Squad Page
 * breakpoint frames.
 */
export const ViewportFrame = ({
  width,
  height,
  label,
  scale = 1,
  children,
}: {
  width: number;
  height: number;
  label: string;
  scale?: number;
  children: ReactNode;
}): ReactElement => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<{
    render: (node: ReactNode) => void;
    unmount: () => void;
  } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) {
      return undefined;
    }
    doc.open();
    doc.write('<!doctype html><html><head></head><body></body></html>');
    doc.close();
    doc.documentElement.className = document.documentElement.className;
    document.head
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((node) => doc.head.appendChild(node.cloneNode(true)));
    doc.body.style.margin = '0';
    const mount = doc.createElement('div');
    doc.body.appendChild(mount);
    rootRef.current = createRoot(mount);
    setReady(true);

    const theme = new MutationObserver(() => {
      doc.documentElement.className = document.documentElement.className;
    });
    theme.observe(document.documentElement, { attributes: true });

    return () => {
      theme.disconnect();
      const root = rootRef.current;
      rootRef.current = null;
      setTimeout(() => root?.unmount());
    };
  }, []);

  useEffect(() => {
    if (ready) {
      rootRef.current?.render(children);
    }
  }, [ready, children]);

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <span className="text-text-tertiary typo-footnote">{label}</span>
      <div
        style={{ width: width * scale, height: height * scale }}
        className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
      >
        <iframe
          ref={frameRef}
          title={label}
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  );
};
