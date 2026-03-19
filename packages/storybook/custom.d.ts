declare module '*.css';

declare module '*.png' {
  const value: string;
  export default value;
}

declare module 'react-syntax-highlighter/dist/esm/languages/hljs' {
  const languages: Record<string, unknown>;
  export = languages;
}
