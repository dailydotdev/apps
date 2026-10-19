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
import { mountFrame } from '../_frame';

// A device of its own width: a blank frame with this document's styles,
// portaled into so React context still reaches the page inside. Its media
// queries and fixed positions see the device, so one responsive page shows
// its real phone, tablet and laptop layouts side by side.

export const devices = {
  laptopL: { width: 1440, height: 900, label: 'Laptop L · 1440' },
  laptop: { width: 1024, height: 768, label: 'Laptop · 1024' },
  tablet: { width: 768, height: 1024, label: 'Tablet · 768' },
  phone: { width: 375, height: 812, label: 'Phone · 375' },
  phoneS: { width: 360, height: 740, label: 'Small phone · 360' },
};

export type DeviceName = keyof typeof devices;

const DeviceUrlContext = createContext<(url: string) => void>(() => undefined);

/** Lets the page inside a Device show the URL it is on. */
export const useDeviceUrl = (): ((url: string) => void) =>
  useContext(DeviceUrlContext);

export const Device = ({
  device,
  label,
  url: initialUrl = '/sources',
  theme,
  height: heightOverride,
  children,
}: {
  device: DeviceName;
  label?: ReactNode;
  url?: string;
  /** Pins the frame's theme; it follows the story's otherwise. */
  theme?: 'dark' | 'light';
  height?: number;
  children: ReactNode;
}): ReactElement => {
  const { width, height: deviceHeight } = devices[device];
  const height = heightOverride ?? deviceHeight;
  const isPhone = width < 656;
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  // A catalog holds dozens of devices: each mounts its page once it nears
  // the screen, and stays mounted.
  const [isNear, setIsNear] = useState(false);
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    const element = box.current;
    if (!element || isNear) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsNear(true),
      { rootMargin: '600px 0px' },
    );
    observer.observe(element);
    // A hidden tab never reports intersections; everything mounts anyway
    // once the first screen has had its turn.
    const fallback = window.setTimeout(() => setIsNear(true), 4000);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [isNear]);

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
    if (!frame) {
      return undefined;
    }
    let cleanup: (() => void) | undefined;
    // The blank frame can finish its first load after this mounts, and that
    // load replaces the document: a document without the mark is mounted
    // again. mountFrame's own write fires load too, which the mark ignores.
    const setup = () => {
      const doc = frame.contentDocument;
      if (!doc || doc.documentElement.dataset.sxMounted) {
        return;
      }
      cleanup?.();
      const unmount = mountFrame(doc);
      const html = doc.documentElement;
      html.dataset.sxMounted = 'true';
      // mountFrame keeps the frame on the story's theme; a pinned theme
      // wins over it every time it does.
      const pin = () => {
        if (theme && html.classList.value !== theme) {
          html.className = theme;
        }
      };
      pin();
      const pinned = new MutationObserver(pin);
      pinned.observe(html, { attributes: true, attributeFilter: ['class'] });
      setBody(doc.body);
      cleanup = () => {
        pinned.disconnect();
        unmount();
      };
    };
    setup();
    frame.addEventListener('load', setup);
    return () => {
      frame.removeEventListener('load', setup);
      cleanup?.();
    };
  }, [frame, theme]);

  return (
    <div ref={box} className="flex w-full min-w-0 flex-col gap-2">
      <span className="font-bold text-text-tertiary typo-caption1">
        {label ?? devices[device].label}
        {theme && ` · ${theme}`}
      </span>
      <div
        style={{ width: width * scale }}
        className={classNames(
          'overflow-hidden border border-border-subtlest-tertiary bg-background-default',
          isPhone ? 'rounded-32' : 'rounded-16',
        )}
      >
        {!isPhone && (
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
        )}
        <div style={{ height: height * scale }}>
          <iframe
            ref={setFrame}
            title={typeof label === 'string' ? label : devices[device].label}
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              border: 0,
              display: 'block',
            }}
          >
            {body && isNear && (
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
