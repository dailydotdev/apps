// Stories import shared components that pull in SVGR icon modules (`*.svg`).
// Mirror packages/shared/custom.d.ts so the storybook type-check can resolve
// them instead of failing with TS2307 (the SVGR webpack/vite loader handles the
// runtime; this is just the type side).
type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
  const value: SvgrComponent;
  export default value;
}

declare module '*.css';

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
