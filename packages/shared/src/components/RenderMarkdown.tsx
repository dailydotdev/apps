import React, { ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
import { LightAsync as SyntaxHighlighterAsync } from 'react-syntax-highlighter';
import dynamic from 'next/dynamic';

import styles from './markdown.module.css';

const ReactMarkdown = dynamic(
  // @ts-expect-error issue with next/dynamic types
  () => import(/* webpackChunkName: "reactMarkdown" */ 'react-markdown'),
);

export type RenderMarkdownProps = {
  className?: string;
  content: string;
};

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
}: RenderMarkdownProps): ReactElement => {
  const [plugins, setPlugins] = useState([]);

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

          return !inline && language ? (
            <SyntaxHighlighterAsync
              {...props}
              customStyle={containerReset}
              language={language}
              useInlineStyles={false}
              codeTagProps={{
                className: codeClassName,
              }}
            >
              {String(children).replace(replaceNewLineRegex, '')}
            </SyntaxHighlighterAsync>
          ) : (
            <code {...props} className={codeClassName}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export { RenderMarkdown };

// TODO WT-1554-stream-rendering remove this
export const carStoryMarkdownTest = `# Automatopia: The Autozens' Tale

Once upon a time in the bustling city of Automatopia, cars ruled the streets and highways.
These weren't ordinary cars; they were alive, each with its own unique personality and capabilities.
They were called "Autozens."

In Automatopia, the Autozens lived peacefully alongside humans, who cared for and respected them like family members.
The city thrived on the harmony between the two, with each car having a special bond with its owner.

Among them was Zoomer, a sleek, silver sports car, who loved nothing more than the rush of the wind on the open road.
Zoomer was owned by Alex, a passionate and adventurous young driver.
Together, they explored every corner of Automatopia, embarking on thrilling journeys, and even participating in races to test their speed.

~~~javascript
const a = 1;

a += 1

for (let i=0; i += 1; i < 10) {
  console.log(a + i)
}
~~~

### Recap
Among them was Zoomer, a sleek, **silver sports car, who** loved nothing more than the rush of the wind on the open road.
Zoomer was owned by Alex, a passionate and adventurous young driver.
Together, they explored every corner of Automatopia, embarking on thrilling journeys, and even participating in races to test their speed.

~~~html
<!DOCTYPE html>
<html>
  <head>
    <title>Markdown Example</title>
  </head>
  <body>
    <h1>Hello, Markdown!</h1>
  </body>
</html>
~~~

## Result

Markdown is a powerful and versatile tool for creating well-formatted documents.
With its straightforward syntax and broad compatibility, Markdown is widely used across various platforms and applications.
Start using Markdown today and enhance your documentation experience!

### The city

~~~javascript
const a = 1;

a += 1

for (let i=0; i += 1; i < 10) {
  console.log(a + i)
}
~~~

Across \`const c = 'inline'\` the city lived Betty, a cheerful minivan that belonged to the Morrison family. Betty had a warm heart, and she was always ready to take the children to school, soccer practice, or family outings. The Morrisons loved Betty dearly, and she cherished every moment spent with them, creating beautiful memories along the way.

However, not all cars were content in Automatopia. Rusty, an old and forgotten car, felt neglected and envious of the attention others received. He resided in a forgotten corner of the city, dreaming of being loved and appreciated like the other Autozens.

One day, a city-wide competition called "The Great Rally" was announced, promising fame and fortune to the winner. The race would be a test of skills, speed, and intelligence, bringing excitement to every car in Automatopia. Zoomer and Betty were thrilled to participate, excited to showcase their abilities to their loved ones.

### Rusty

When **Rusty** heard about the race, he saw an opportunity to prove his worth. Determined to change his destiny, he decided to join the competition as well, despite his old age and doubts. Rusty spent days in the garage, working hard to regain his former glory.

The day of the Great Rally finally arrived. The city's streets were filled with cheering crowds, excited to witness the thrilling race. Zoomer and Betty lined up with other cars, exuding confidence and enthusiasm. Meanwhile, Rusty stood nervously at the starting line, unsure of what the race would hold for him.

As the race began, Zoomer and Betty showcased their exceptional skills, leaving behind a trail of awe-struck spectators. They raced neck to neck, pushing themselves to their limits. The crowd marveled at their speed and precision.

~~~javascript
const a = 1;

a += 1

for (let i=0; i += 1; i < 10) {
  console.log(a + i)
}
~~~

Rusty, on the other hand, struggled initially, but he refused to give up. He remembered the joy and pride he saw in the eyes of others and found the strength to carry on. Slowly, he gained confidence, pushing forward with determination, surprising everyone with his perseverance.

As the race continued, Zoomer and Betty found themselves side by side, both reluctant to overtake the other. They valued their friendship more than victory, so they decided to cross the finish line together, sharing the glory and celebrating their bond.

However, the true surprise came from Rusty. With an unexpected burst of energy, he overtook the others and crossed the finish line first. The crowd erupted in cheers, celebrating his triumphant comeback. Rusty couldn't believe it—his dream of being appreciated had come true.

In the end, the Great Rally taught everyone a valuable lesson: it's not just about speed and victory, but about the love, companionship, and determination that made the Autozens special. From that day on, Rusty was no longer overlooked; he became a respected and cherished member of the Automatopia community.

~~~javascript
const a = 1;

a += 1

for (let i=0; i += 1; i < 10) {
  console.log(a + i)
}
~~~

#### Some rust

~~~rust
fn main() {
  // Statements here are executed when the compiled binary is called.

  // Print text to the console.
  println!("Hello World!");
}
~~~

## The end

And so, in the city of Automatopia, the cars continued to live harmoniously with their human companions, cherishing the bonds they shared and forever embracing the spirit of adventure and unity.`;
