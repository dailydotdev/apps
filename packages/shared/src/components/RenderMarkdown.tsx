import React, { ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
import { LightAsync as SyntaxHighlighterAsync } from 'react-syntax-highlighter';
import dynamic from 'next/dynamic';

import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import styles from './markdown.module.css';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { CopyIcon } from './icons';
import { useCopyText } from '../hooks/useCopy';

const ReactMarkdown = dynamic(
  // @ts-expect-error issue with next/dynamic types
  () => import(/* webpackChunkName: "reactMarkdown" */ 'react-markdown'),
);

export interface RenderMarkdownProps {
  isLoading?: boolean;
  className?: string;
  content: string;
  reactMarkdownProps?: Omit<ReactMarkdownOptions, 'children'>;
}

const replaceNewLineRegex = /\n$/;

const containerReset = {
  backgroundColor: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
};

let languagesLoad: Promise<unknown>;

const loadAndRegisterLanguages = async () => {
  const languages = await import(
    /* webpackChunkName: "reactSyntaxHighlighterLanguages" */
    'react-syntax-highlighter/dist/esm/languages/hljs'
  );

  Object.keys(languages).forEach((language) => {
    SyntaxHighlighterAsync.registerLanguage(language, languages[language]);
  });

  if (languages.xml) {
    // html is a subset of xml, there is no html language in react-syntax-highlighter
    // https://github.com/react-syntax-highlighter/react-syntax-highlighter/issues/196#issuecomment-645776848
    SyntaxHighlighterAsync.registerLanguage('html', languages.xml);
  }

  return languages;
};

const loadLanguages = async (): Promise<unknown> => {
  try {
    if (!languagesLoad) {
      languagesLoad = loadAndRegisterLanguages();
    }

    return languagesLoad;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('markdown languages failed to load');

    return undefined;
  }
};

let pluginsLoad: Promise<unknown[]>;

const loadPlugins = async (): Promise<unknown[]> => {
  const loadPlugin = async (loadFn: () => Promise<unknown>) => {
    return loadFn();
  };

  try {
    if (!pluginsLoad) {
      pluginsLoad = Promise.all([
        loadPlugin(async () => {
          const importedModule = await import(
            /* webpackChunkName: "remarkGfm" */ 'remark-gfm'
          );
          const remarkGfm = importedModule.default;

          return [
            remarkGfm,
            { singleTilde: false } as Parameters<typeof remarkGfm>[0],
          ];
        }),
      ]);
    }

    return pluginsLoad;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('markdown plugins failed to load');

    return [];
  }
};

const RenderMarkdown = ({
  className,
  content,
  reactMarkdownProps,
  isLoading = false,
}: RenderMarkdownProps): ReactElement => {
  const [plugins, setPlugins] = useState([]);
  const [copying, copy] = useCopyText();

  useEffect(() => {
    let mounted = true;

    loadPlugins().then((loadedPlugins) => {
      if (mounted) {
        setPlugins(loadedPlugins);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ReactMarkdown
      className={classNames(styles.markdown, className)}
      linkTarget="_blank"
      remarkPlugins={plugins}
      components={{
        ol({ children }) {
          return <ol>{children}</ol>;
        },
        code({
          node,
          inline,
          className: codeClassName,
          children,
          style,
          ...props
        }) {
          const match = /language-(\w+)/.exec(codeClassName || '');
          const language = match?.[1];

          if (language) {
            loadLanguages();
          }

          return (
            <>
              {!inline && (
                <div className="flex items-center justify-between bg-surface-float px-5 py-2">
                  <span className="inline leading-8 text-text-tertiary">
                    {language || 'code'}
                  </span>

                  <Button
                    variant={ButtonVariant.Tertiary}
                    icon={<CopyIcon />}
                    disabled={copying || isLoading}
                    size={ButtonSize.XSmall}
                    onClick={() =>
                      copy({
                        textToCopy: String(children),
                      })
                    }
                  />
                </div>
              )}

              {!inline ? (
                <div className="px-5 py-3">
                  <SyntaxHighlighterAsync
                    {...props}
                    customStyle={containerReset}
                    language={language}
                    useInlineStyles={false}
                    wrapLongLines
                    codeTagProps={{
                      className: codeClassName,
                    }}
                  >
                    {String(children).replace(replaceNewLineRegex, '')}
                  </SyntaxHighlighterAsync>
                </div>
              ) : (
                <code {...props} className={codeClassName}>
                  {children}
                </code>
              )}
            </>
          );
        },
      }}
      {...reactMarkdownProps}
    >
      {content}
    </ReactMarkdown>
  );
};

export { RenderMarkdown };
