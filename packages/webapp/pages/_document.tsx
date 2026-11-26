import type { ReactElement } from 'react';
import React from 'react';
import type { DocumentProps } from 'next/document';
import { Html, Head, Main, NextScript } from 'next/document';

const CHATGPT_EMBED_PAGES = ['/embed/chatgpt/post'];

const getChatGptHistoryPatch = (page: string): string =>
  `if(window.parent!==window){history.replaceState(history.state,'',location.origin+${JSON.stringify(page)});['pushState','replaceState'].forEach(function(m){var o=history[m].bind(history);history[m]=function(s,t,u){if(u!=null){var x=new URL(u,document.baseURI);u=location.origin+x.pathname+x.search+x.hash}return o(s,t,u)}})}`;

const Document = ({ __NEXT_DATA__ }: DocumentProps): ReactElement => (
  <Html>
    <Head>
      {CHATGPT_EMBED_PAGES.includes(__NEXT_DATA__.page) && (
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: getChatGptHistoryPatch(__NEXT_DATA__.page),
          }}
        />
      )}
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
