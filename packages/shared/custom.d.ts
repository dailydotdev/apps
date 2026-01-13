declare module '*.css';

type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
  const value: SvgrComponent;
  export default value;
}

interface Window {
  Intercom?: (command: string, ...args: unknown[]) => void;
}
