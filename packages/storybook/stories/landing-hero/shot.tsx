import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
// @ts-expect-error react-dom ships no types in this package
import { createPortal } from 'react-dom';
import { mountFrame } from '../_frame';
import './landing.css';

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';

const ensureFont = (doc: Document): void => {
  if (doc.head.querySelector(`link[href="${FONT_HREF}"]`)) {
    return;
  }
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONT_HREF;
  doc.head.appendChild(link);
};

/**
 * The landing page in a frame of its own width, scaled down to the canvas.
 * The hero lays out off the viewport (`clamp(…vw…)`, the md breakpoint), so
 * a 1440 frame shows the laptop hero and a 390 frame the phone one, each as a
 * visitor would see it.
 */
export const Shot = ({
  width = 1440,
  label,
  note,
  children,
}: {
  width?: number;
  label?: ReactNode;
  note?: ReactNode;
  children: ReactNode;
}): ReactElement => {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState(900);

  useLayoutEffect(() => {
    const element = box.current;
    if (!element) {
      return undefined;
    }
    const observer = new ResizeObserver(() =>
      setScale(Math.min(1, element.clientWidth / width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    const doc = frame?.contentDocument;
    const view = doc?.defaultView;
    if (!doc || !view) {
      return undefined;
    }
    ensureFont(document);
    const unmount = mountFrame(doc);
    ensureFont(doc);
    doc.body.className = 'lh-root';
    setBody(doc.body);
    const observer = new view.ResizeObserver(() =>
      setHeight(doc.documentElement.scrollHeight),
    );
    observer.observe(doc.body);
    return () => {
      observer.disconnect();
      unmount();
    };
  }, [frame]);

  return (
    <div ref={box} className="flex min-w-0 flex-col gap-2">
      {(label || note) && (
        <div className="flex items-baseline justify-between gap-4">
          {label && (
            <span className="font-bold text-text-tertiary typo-caption1">
              {label}
            </span>
          )}
          {note && (
            <span className="text-text-quaternary typo-caption1">{note}</span>
          )}
        </div>
      )}
      <div
        style={{ width: width * scale, height: height * scale }}
        className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
      >
        <iframe
          ref={setFrame}
          title={typeof label === 'string' ? label : 'Landing hero'}
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            border: 0,
            display: 'block',
          }}
        >
          {body && createPortal(children, body)}
        </iframe>
      </div>
    </div>
  );
};

export const LAPTOP = 1440;
export const PHONE = 390;
