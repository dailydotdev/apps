import React, { ReactElement } from 'react';
import { Html, Head, Main, NextScript } from 'next/document';
import { readFileSync } from 'fs';
import { join } from 'path';

class InlineStylesHead extends Head {
  getCssLinks: Head['getCssLinks'] = ({ allFiles }) => {
    const { assetPrefix } = this.context;
    if (!allFiles || allFiles.length === 0) {
      return null;
    }
    return allFiles
      .filter((file: string) => /\.css$/.test(file))
      .map((file: string) => (
        <style
          key={file}
          nonce={this.props.nonce}
          data-href={`${assetPrefix}/_next/${file}`}
          dangerouslySetInnerHTML={{
            __html: readFileSync(join(process.cwd(), '.next', file), 'utf-8'),
          }}
        />
      ));
  };
}

export default function Document(): ReactElement {
  return (
    <Html>
      <InlineStylesHead />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
