import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Opportunity } from '../types';

const OPTIMISTIC_PAYMENT_KEY = 'recruiter_optimistic_payment';
const OPTIMISTIC_PAYMENT_TTL_MS = 60_000; // 1 minute TTL for optimistic state

interface OptimisticPaymentData {
  opportunityId: string;
  timestamp: number;
}

/**
 * Check if there's a valid optimistic payment flag for the given opportunity.
 * This is used when redirecting from payment page before webhook completes.
 */
const getOptimisticPayment = (
  opportunityId: string,
): OptimisticPaymentData | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = sessionStorage.getItem(OPTIMISTIC_PAYMENT_KEY);
    if (!stored) {
      return null;
    }

    const data: OptimisticPaymentData = JSON.parse(stored);

    // Check if it matches the opportunity and hasn't expired
    if (
      data.opportunityId === opportunityId &&
      Date.now() - data.timestamp < OPTIMISTIC_PAYMENT_TTL_MS
    ) {
      return data;
    }

    // Clean up expired/mismatched data
    sessionStorage.removeItem(OPTIMISTIC_PAYMENT_KEY);
    return null;
  } catch {
    return null;
  }
};

/**
 * Set optimistic payment flag after successful checkout.
 * This allows the user to proceed to prepare page while webhook processes.
 */
export const setOptimisticPayment = (opportunityId: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const data: OptimisticPaymentData = {
    opportunityId,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(OPTIMISTIC_PAYMENT_KEY, JSON.stringify(data));
};

/**
 * Clear optimistic payment flag (called when real payment is confirmed).
 */
export const clearOptimisticPayment = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(OPTIMISTIC_PAYMENT_KEY);
};

interface UseRequirePaymentOptions {
  opportunity: Opportunity | undefined;
  opportunityId: string;
}

interface UseRequirePaymentResult {
  isPaid: boolean;
  isCheckingPayment: boolean;
  isOptimisticPayment: boolean;
}

export const useRequirePayment = ({
  opportunity,
  opportunityId,
}: UseRequirePaymentOptions): UseRequirePaymentResult => {
  const router = useRouter();
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);

  const hasRealPayment = !!opportunity?.flags?.plan;
  const hasOptimisticPayment = !!getOptimisticPayment(opportunityId);
  const isPaid = hasRealPayment || hasOptimisticPayment;

  // Clear optimistic payment when real payment is confirmed
  useEffect(() => {
    if (hasRealPayment && hasOptimisticPayment) {
      clearOptimisticPayment();
    }
  }, [hasRealPayment, hasOptimisticPayment]);

  useEffect(() => {
    if (!opportunity) {
      return;
    }

    if (!isPaid) {
      router.replace(`/recruiter/${opportunityId}/plans?required=1`);
      return;
    }

    setIsCheckingPayment(false);
  }, [opportunity, isPaid, opportunityId, router]);

  return {
    isPaid,
    isCheckingPayment: !opportunity || isCheckingPayment,
    isOptimisticPayment: hasOptimisticPayment && !hasRealPayment,
  };
};
