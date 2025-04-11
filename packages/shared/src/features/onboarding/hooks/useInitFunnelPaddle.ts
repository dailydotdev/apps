import { useSetAtom } from 'jotai/react';
import { useCallback, useEffect } from 'react';
import type { Paddle } from '@paddle/paddle-js';
import { CheckoutEventNames } from '@paddle/paddle-js';
import type { PaddleEventCallback } from '../../payment/hooks/usePaddle';
import { usePaddle } from '../../payment/hooks/usePaddle';
import { paddleInstanceAtom } from '../store/funnelStore';

export interface UseFunnelPaddleProps {
  paddleCallback?: PaddleEventCallback;
}

export const useInitFunnelPaddle = (): {
  paddle: Paddle | null;
} => {
  const setPaddleInstance = useSetAtom(paddleInstanceAtom);

  const handlePaddleCallback: PaddleEventCallback = useCallback((event) => {
    window.dispatchEvent(new CustomEvent('paddle-event', { detail: event }));
  }, []);

  const { paddle } = usePaddle({
    paddleCallback: handlePaddleCallback,
    disabledEvents: [CheckoutEventNames.CHECKOUT_LOADED],
  });

  useEffect(() => {
    if (paddle) {
      setPaddleInstance(paddle);
    }
  }, [paddle, setPaddleInstance]);

  return {
    paddle,
  };
};
