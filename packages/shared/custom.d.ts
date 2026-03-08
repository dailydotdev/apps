declare module '*.css';

type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
  const value: SvgrComponent;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

interface Window {
  Intercom?: (command: string, ...args: unknown[]) => void;
  reactModalInit?: boolean;
  eventControllers?: Record<string, AbortController | null>;
  webkit?: {
    messageHandlers?: Partial<
      Record<string, { postMessage: (payload: unknown) => void }>
    >;
  };
}

declare module 'uuid';
