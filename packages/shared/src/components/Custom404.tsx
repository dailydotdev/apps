import React, { ReactElement, ReactNode } from 'react';
import HelloWorldSvg from '../svg/HelloWorldSvg';

interface Custom404Props {
  children?: ReactNode;
}

export default function Custom404({ children }: Custom404Props): ReactElement {
  return (
    <div
      className="flex flex-col justify-center items-center mx-auto min-h-screen"
      data-testid="notFound"
    >
      {children}
      <HelloWorldSvg
        style={{ width: '55%', maxWidth: '32.75rem' }}
        className="self-center mb-10"
      />
      <h1 className="mx-9 font-bold text-center break-words-overflow typo-title1">
        Oops, this page couldn’t be found
      </h1>
    </div>
  );
}
