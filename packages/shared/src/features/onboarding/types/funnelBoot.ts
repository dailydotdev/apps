import type { Boot } from '../../../lib/boot';
import type { FunnelJSON } from './funnel';

export interface StepInput {
  [key: string]: unknown;
}

export interface FunnelSession {
  id: string;
  userId: string;
  currentStep: string | null;
  steps: Record<
    string,
    {
      inputs: StepInput | null;
    }
  >;
}

export interface FunnelState {
  session: FunnelSession;
  funnel: FunnelJSON;
}

export interface FunnelBootData extends Boot {
  funnelState: FunnelState;
}

export interface FunnelBootResponse {
  data: FunnelBootData;
  response: Response;
}
