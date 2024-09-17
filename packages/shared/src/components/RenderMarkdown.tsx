import React, { ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
import { LightAsync as SyntaxHighlighterAsync } from 'react-syntax-highlighter';
import dynamic from 'next/dynamic';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import styles from './markdown.module.css';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { ArrowIcon, CopyIcon } from './icons';
import { useCopyText } from '../hooks/useCopy';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from './typography/Typography';

const ReactMarkdown = dynamic(
  // @ts-expect-error issue with next/dynamic types
  () => import(/* webpackChunkName: "reactMarkdown" */ 'react-markdown'),
);

const SyntaxHighlighter = dynamic(() =>
  import(
    /* webpackChunkName: "reactSyntaxHighlighter" */ 'react-syntax-highlighter'
  ).then((mod) => mod.Light),
);

interface RenderMarkdownHeaderProps {
  buttons?: ReactElement;
}

export interface RenderMarkdownProps {
  isLoading?: boolean;
  header?: RenderMarkdownHeaderProps;
  className?: string;
  content: string;
  reactMarkdownProps?: Omit<ReactMarkdownOptions, 'children'>;
  isExpandable?: boolean;
}

const replaceNewLineRegex = /\n$/;

const MIN_CONTENT_HEIGHT = 152;

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
  header,
  content,
  reactMarkdownProps,
  isLoading = false,
  isExpandable = false,
}: RenderMarkdownProps): ReactElement => {
  const [canExpand, setCanExpand] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [plugins, setPlugins] = useState([]);
  const [copying, copy] = useCopyText();

  useEffect(() => {
    setCanExpand(false);
  }, [content]);

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
          const Wrapper = language ? SyntaxHighlighterAsync : SyntaxHighlighter;
          if (language) {
            loadLanguages();
          }

          return (
            <>
              {!inline && (
                <div className="flex h-10 items-center justify-between bg-surface-float px-3">
                  <Typography
                    type={TypographyType.Callout}
                    bold
                    color={TypographyColor.Secondary}
                    tag={TypographyTag.Span}
                    className="inline leading-8"
                  >
                    {language || 'Code snippet'}
                  </Typography>
                  <div className="flex gap-2">
                    <Button
                      variant={ButtonVariant.Tertiary}
                      icon={<CopyIcon />}
                      disabled={copying || isLoading}
                      size={ButtonSize.Small}
                      onClick={() =>
                        copy({
                          textToCopy: String(children),
                        })
                      }
                    />
                    {header?.buttons ? header.buttons : null}
                  </div>
                </div>
              )}

              {!inline ? (
                <div
                  className={classNames(
                    'px-5 py-3',
                    isExpanded || !isExpandable
                      ? undefined
                      : 'line-clamp-6 max-h-[9.5rem] break-words',
                  )}
                  ref={(element) => {
                    if (isExpandable && element && !canExpand) {
                      setCanExpand(element.scrollHeight > MIN_CONTENT_HEIGHT);
                    }
                  }}
                >
                  <Wrapper
                    customStyle={containerReset}
                    language={language}
                    useInlineStyles={false}
                    wrapLongLines
                    codeTagProps={{
                      className: codeClassName,
                    }}
                  >
                    {String(children).replace(replaceNewLineRegex, '')}
                  </Wrapper>
                </div>
              ) : (
                <code {...props} className={codeClassName}>
                  {children}
                </code>
              )}
              {canExpand ? (
                <div className="relative z-1 flex h-12 items-center justify-center bg-surface-float">
                  <Button
                    onClick={() => setIsExpanded((prev) => !prev)}
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.Small}
                    icon={
                      <ArrowIcon
                        className={isExpanded ? undefined : 'rotate-180'}
                      />
                    }
                    iconPosition={ButtonIconPosition.Right}
                  >
                    {isExpanded ? 'Minimize' : 'Expand'}
                  </Button>
                </div>
              ) : undefined}
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
