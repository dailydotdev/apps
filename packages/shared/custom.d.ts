declare module '*.css';
import * as React from 'react';

type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
  const value: SvgrComponent;
  export default value;
}

declare module 'react' {
  interface HTMLAttributes {
    ['data-testid']?: string;
  }
}
