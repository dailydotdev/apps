import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Opportunity } from '../types';

interface UseRequirePaymentOptions {
  opportunity: Opportunity | undefined;
  opportunityId: string;
}

interface UseRequirePaymentResult {
  isPaid: boolean;
  isCheckingPayment: boolean;
}

export const useRequirePayment = ({
  opportunity,
  opportunityId,
}: UseRequirePaymentOptions): UseRequirePaymentResult => {
  const router = useRouter();
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);

  const isPaid = !!opportunity?.flags?.plan;

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
  };
};
