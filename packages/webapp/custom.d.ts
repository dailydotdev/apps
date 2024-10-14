import { AriaAttributes, DOMAttributes } from 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}

type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
  const value: SvgrComponent;
  export default value;
}
