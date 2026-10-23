// Vite's ?raw import: the spec pages render the Markdown files as text.
declare module '*.md?raw' {
  const source: string;
  export default source;
}
