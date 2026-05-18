import { useAuthContext } from '../../contexts/AuthContext';
import { featureLayoutV2 } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useViewSize, ViewSize } from '../useViewSize';

export const LayoutVariant = {
  Control: 'control',
  V1: 'v1',
} as const;

export type LayoutVariantType =
  (typeof LayoutVariant)[keyof typeof LayoutVariant];

const validVariants = new Set<LayoutVariantType>(Object.values(LayoutVariant));

const toLayoutVariant = (value: unknown): LayoutVariantType =>
  validVariants.has(value as LayoutVariantType)
    ? (value as LayoutVariantType)
    : LayoutVariant.Control;

interface UseLayoutVariant {
  variant: LayoutVariantType;
  isControl: boolean;
  isV1: boolean;
}

export const useLayoutVariant = (): UseLayoutVariant => {
  const { isAuthReady } = useAuthContext();
  const isTabletUp = useViewSize(ViewSize.Tablet);
  const { value } = useConditionalFeature({
    feature: featureLayoutV2,
    shouldEvaluate: isAuthReady && isTabletUp,
  });
  const variant = toLayoutVariant(value);

  return {
    variant,
    isControl: variant === LayoutVariant.Control,
    isV1: variant === LayoutVariant.V1,
  };
};
