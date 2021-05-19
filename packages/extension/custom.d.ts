type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
  const value: SvgrComponent;
  export default value;
}

declare module '*.css' {
  const mod: { [cls: string]: string };
  export default mod;
}
