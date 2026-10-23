import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Browser } from './PaddleFrameMock';
import type { CheckoutSlots } from './CheckoutPage';
import { CheckoutPage } from './CheckoutPage';
import type { CheckoutState } from './model';
import { initialState } from './model';
import { SuccessPage } from './panels';
import { SyncedChecklist } from '../showcase/variants';

/* The clickable prototype. Every interaction the real page has:
   - Annual / Monthly  → production: openCheckout() → Paddle.Checkout.updateItems
   - seats ±           → updateItems with quantity
   - method tiles      → inside Paddle's frame (shown for completeness)
   - Subscribe now     → Paddle: checkout.payment.initiated → processing
                         → checkout.completed → success page
                         or checkout.payment.failed → decline message, retry
   - Continue (phones, step 1) → step 2 (payment); Back / Change → step 1
   - Buying for a team? / Give Plus as a gift → switch purchase in place */

export type PrototypeArgs = Partial<CheckoutState> & {
  browser?: Browser;
  /** The next Subscribe fails once (card declined), then succeeds. */
  decline?: boolean;
  /** Start in Paddle's loading state and become ready after ~1s. */
  simulateLoad?: boolean;
  slots?: CheckoutSlots;
  /** plays = the feature list drives the scene window (showcase B, the design since 15 Oct); static = the 12 Oct checklist. */
  featureList?: 'plays' | 'static';
  /** Extra content on the success page (8. Showcase variants). */
  successExtra?: ReactNode;
};

export const Prototype = ({ browser = 'chrome', decline, simulateLoad, slots: slotsArg, successExtra, featureList = 'plays', ...args }: PrototypeArgs): ReactElement => {
  const [state, setState] = useState<CheckoutState>({ ...initialState, ...args });
  const declinedOnce = useRef(false);
  const payTimer = useRef<ReturnType<typeof setTimeout>>();
  const key = JSON.stringify(args);
  const slots: CheckoutSlots | undefined =
    featureList === 'plays' && !slotsArg?.features
      ? { ...slotsArg, features: (s) => <SyncedChecklist state={s} /> }
      : slotsArg;

  // Storybook controls reset the prototype.
  useEffect(() => {
    clearTimeout(payTimer.current);
    setState({ ...initialState, ...args });
    declinedOnce.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => () => clearTimeout(payTimer.current), []);

  // Paddle loading: the frame mounts ~1s after the page.
  useEffect(() => {
    if (state.phase !== 'loading' || !simulateLoad) {
      return undefined;
    }
    const t = setTimeout(() => setState((s) => ({ ...s, phase: 'ready' })), 900);
    return () => clearTimeout(t);
  }, [state.phase, simulateLoad]);

  const onPay = () => {
    setState((s) => ({ ...s, phase: 'processing' }));
    clearTimeout(payTimer.current);
    payTimer.current = setTimeout(() => {
      if (decline && !declinedOnce.current) {
        declinedOnce.current = true;
        setState((s) => ({ ...s, phase: 'declined' }));
        return;
      }
      setState((s) => ({ ...s, phase: 'success' }));
    }, 1400);
  };

  if (state.phase === 'success') {
    return (
      <div className="min-h-screen">
        <SuccessPage
          cycle={state.cycle}
          gift={state.purchase === 'gift' ? state.giftTo?.name : undefined}
          kind={state.purchase === 'gift' ? 'gift' : state.purchase === 'team' ? 'team' : state.platform === 'ios' ? 'ios' : 'personal'}
          seats={state.seats}
        >
          {successExtra}
        </SuccessPage>
      </div>
    );
  }

  return (
    <CheckoutPage
      state={state}
      browser={browser}
      slots={slots}
      onChange={(patch) => setState((s) => ({ ...s, ...patch, phase: s.phase === 'declined' ? 'ready' : s.phase }))}
      onPay={onPay}
    />
  );
};
