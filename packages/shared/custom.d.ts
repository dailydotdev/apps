declare module '*.css';

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>;

declare module 'react-syntax-highlighter/dist/esm/languages/hljs' {
  const languages: Record<string, unknown>;
  export = languages;
}

declare module '*.svg' {
  const value: SvgrComponent;
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
