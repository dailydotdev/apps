import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { MobileAppFooter } from '@dailydotdev/shared/src/features/getApp/components/MobileAppFooter';
import { mobileAppFooterHeight } from '@dailydotdev/shared/src/features/getApp/mobileAppFooter';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { cloudinaryCharmNoComments } from '@dailydotdev/shared/src/lib/image';

/**
 * The phone footer that won mobile_app_footer (app usage +167%), the real
 * component, mounted the way FooterWrapper mounts it. Only its title
 * changes on a post page: "See all posts" today, the comment copy here.
 */
export const PhoneFooter = ({ title }: { title: string }): ReactElement => (
  <div className="pointer-events-none fixed !bottom-0 left-0 z-3 w-full">
    <div className="pointer-events-auto">
      <MobileAppFooter title={title} />
    </div>
  </div>
);

/** The page spacer FooterNavBarLayout keeps under the phone footer. */
export const PhoneFooterSpacer = (): ReactElement => (
  <div aria-hidden className={mobileAppFooterHeight} />
);

/**
 * MobileAppFooter's markup and animation, line for line, with a sign-up
 * button where the app button is. Desktop has no app to open, so this is
 * the "like the mobile one" footer for laptop.
 */
export const SignupFooterCard = ({
  title,
  cta,
  onSignup,
  onLogin,
}: {
  title: string;
  cta: string;
  onSignup: () => void;
  onLogin: () => void;
}): ReactElement => (
  <div
    className={classNames(
      'pointer-events-none flex flex-col justify-end',
      'h-[calc(9.5rem_+_1.5rem)]',
    )}
  >
    <div className="h-12 bg-gradient-to-b from-transparent to-background-default" />
    <div className="pointer-events-auto relative bg-background-default px-5 pb-6">
      <div className="relative flex h-14 items-end">
        <h3 className="min-w-0 flex-1 pb-2 pr-16 font-bold leading-tight typo-title3">
          {title}
        </h3>
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-2 -right-3 h-[3.625rem] w-[6.625rem] overflow-hidden"
        >
          <div className="animate-charm-rise absolute inset-0">
            <div className="animate-charm-press absolute inset-0">
              <img
                src={cloudinaryCharmNoComments}
                alt=""
                className="absolute -top-2.5 left-0 size-[6.625rem] max-w-none"
              />
            </div>
          </div>
        </div>
        <span className="animate-charm-ripple pointer-events-none absolute -bottom-2.5 right-[2.75rem] z-2 size-5 rounded-max bg-accent-cabbage-default opacity-0 blur-sm" />
      </div>
      <div className="animate-charm-button-press relative z-1 flex items-center gap-3">
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className="flex-1"
          onClick={onSignup}
        >
          {cta}
        </Button>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Large}
          onClick={onLogin}
        >
          Log in
        </Button>
      </div>
    </div>
  </div>
);

/**
 * The laptop footer: SignupFooterCard pinned to the bottom of the window
 * at the post column's width, like X's bar over its centre column. Reads
 * the column from the comment slot so it follows the page's real layout.
 */
export const DesktopColumnFooter = ({
  title,
  onSignup,
  onLogin,
}: {
  title: string;
  onSignup: () => void;
  onLogin: () => void;
}): ReactElement => {
  const marker = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ left: number; width: number }>();

  useEffect(() => {
    const doc = marker.current?.ownerDocument;
    const view = doc?.defaultView;
    if (!doc || !view) {
      return undefined;
    }
    const measure = () => {
      const slot = doc.querySelector('[data-teaser-slot]');
      const rect = slot?.getBoundingClientRect();
      if (rect && rect.width) {
        // The comment column, plus the card's own 20px gutter each side.
        setBox({ left: rect.left - 20, width: rect.width + 40 });
      }
    };
    const timer = view.setInterval(measure, 400);
    view.addEventListener('resize', measure);
    measure();
    return () => {
      view.clearInterval(timer);
      view.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <>
      <span ref={marker} hidden />
      {box && (
        <div
          className="pointer-events-none fixed bottom-0 z-3"
          style={{ left: box.left, width: box.width }}
        >
          <SignupFooterCard
            title={title}
            cta="Sign up"
            onSignup={onSignup}
            onLogin={onLogin}
          />
        </div>
      )}
    </>
  );
};
