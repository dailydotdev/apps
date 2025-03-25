import { isIOSNative } from '../../lib/func';
import { PaddleProvider } from './providers/PaddleProvider';
import { StoreKitProvider } from './providers/StoreKitProvider';
import type { PaymentProvider } from './types';

export class PaymentProviderFactory {
  static createProvider(
    router: ReturnType<typeof useRouter>,
    displayToast: ReturnType<typeof useToastNotification>['displayToast'],
    appAccountToken?: string,
  ): PaymentProvider {
    if (isIOSNative()) {
      return new StoreKitProvider(router, displayToast, appAccountToken);
    }
    return new PaddleProvider();
  }
} 