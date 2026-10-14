import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
// @ts-expect-error react-dom ships no types in this package
import { createPortal } from 'react-dom';
import classNames from 'classnames';

// A device of its own width: a blank frame with this document's styles and
// theme, portaled into so React context still reaches the page inside. Its
// media queries see the frame's width, so one responsive component shows
// its real phone, tablet and laptop layouts side by side. The address row
// above it shows the URL the page sets, for reviewing links and SEO.

const DeviceUrlContext = createContext<(url: string) => void>(() => undefined);

/** Lets the page inside a Device report the URL it would be on. */
export const useDeviceUrl = (): ((url: string) => void) =>
  useContext(DeviceUrlContext);

export const Device = ({
  width,
  height,
  label,
  note,
  children,
  fit = true,
}: {
  width: number;
  height: number;
  label?: ReactNode;
  note?: ReactNode;
  children: ReactNode;
  /** Scale down to the column's width, keeping the real viewport. */
  fit?: boolean;
}): ReactElement => {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [url, setUrl] = useState('/history');

  useLayoutEffect(() => {
    const element = box.current;
    if (!fit || !element) {
      return undefined;
    }
    const observer = new ResizeObserver(() =>
      setScale(Math.min(1, element.clientWidth / width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [fit, width]);

  useEffect(() => {
    const doc = frame?.contentDocument;
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
    doc.body.className = 'bg-background-default text-text-primary';
    doc.body.style.margin = '0';
    setBody(doc.body);

    const theme = new MutationObserver(() => {
      doc.documentElement.className = document.documentElement.className;
    });
    theme.observe(document.documentElement, { attributes: true });
    return () => theme.disconnect();
  }, [frame]);

  return (
    <div
      ref={box}
      className={classNames('flex min-w-0 flex-col gap-2', !fit && 'shrink-0')}
    >
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
        style={{ width: width * scale }}
        className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
      >
        <div className="flex h-8 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-3">
          <span className="flex gap-1">
            <span className="size-2 rounded-full bg-surface-float" />
            <span className="size-2 rounded-full bg-surface-float" />
            <span className="size-2 rounded-full bg-surface-float" />
          </span>
          <span className="min-w-0 flex-1 truncate rounded-6 bg-surface-float px-2 text-text-tertiary typo-caption1">
            daily.dev<span className="text-text-primary">{url}</span>
          </span>
        </div>
        <div style={{ height: height * scale }}>
          <iframe
            ref={setFrame}
            title={typeof label === 'string' ? label : 'Device'}
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              border: 0,
              display: 'block',
            }}
          >
            {body && (
              <DeviceUrlContext.Provider value={setUrl}>
                {createPortal(children, body)}
              </DeviceUrlContext.Provider>
            )}
          </iframe>
        </div>
      </div>
    </div>
  );
};

/** The device sizes the review covers. */
export const devices = {
  laptopXL: { width: 1920, height: 1080, label: 'Laptop XL · 1920' },
  laptopL: { width: 1440, height: 900, label: 'Laptop L · 1440' },
  laptop: { width: 1024, height: 768, label: 'Laptop · 1024' },
  tablet: { width: 768, height: 1024, label: 'Tablet · 768' },
  phone: { width: 375, height: 812, label: 'Phone · 375' },
  phoneS: { width: 360, height: 740, label: 'Small phone · 360' },
};

/**
 * Whether the window the node renders in (a Device's frame here) is at
 * laptop or wider. Read from the node's own window, not the global one.
 */
export const useIsLaptop = (ref: React.RefObject<HTMLElement>): boolean => {
  const [laptop, setLaptop] = useState(true);
  useLayoutEffect(() => {
    const view = ref.current?.ownerDocument.defaultView;
    if (!view) {
      return undefined;
    }
    const query = view.matchMedia('(min-width: 1020px)');
    const sync = () => setLaptop(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [ref]);
  return laptop;
};
