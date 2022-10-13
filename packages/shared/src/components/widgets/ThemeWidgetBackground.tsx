import classNames from 'classnames';
import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import classed from '../../lib/classed';
import DailyIcon from '../icons/DailyIcon';

interface ThemeWidgetBackgroundProps {
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
}

function ThemeWidgetBackground({
  style = {},
  className,
  children,
}: ThemeWidgetBackgroundProps): ReactElement {
  return (
    <div
      className={classNames('h-full', className)}
      style={{
        ...style,
        paddingLeft: '28px',
        background:
          'linear-gradient(270deg, rgba(199, 62, 244, 0.07), rgba(60, 68, 255, 1)',
      }}
    >
      {children}
    </div>
  );
}

const commonClasses = 'absolute right-0 bottom-0 pt-6 pl-7 rounded-14 w-36';
const NodeContainer = classed(
  'span',
  'flex flex-1 p-2 pl-4 w-full h-full rounded-tl-14',
);

export const DarkNode = (
  <NodeContainer
    style={{
      boxShadow: '-8px -8px 22px #00000040',
      background:
        'linear-gradient(270deg, rgba(0, 0, 0, 0.44), rgba(0, 0, 0, 1)',
    }}
  >
    <DailyIcon className="w-6 h-3" style={{ fill: '#FFFFFF' }} />
  </NodeContainer>
);

export const DarkNodeLayout = (
  <ThemeWidgetBackground
    className={commonClasses}
    style={{
      background:
        'linear-gradient(270deg, rgba(0, 0, 0, 0.44), rgba(0, 0, 0, 1)',
    }}
  >
    {DarkNode}
  </ThemeWidgetBackground>
);

export const LightNode = (
  <NodeContainer
    style={{
      boxShadow: '-8px -8px 22px #FFFFFF40',
      background:
        'linear-gradient(270deg, rgba(255, 255, 255, 255.44), rgba(255, 255, 255, 1)',
    }}
  >
    <DailyIcon className="w-6 h-3" style={{ fill: '#000000' }} />
  </NodeContainer>
);

export const LightNodeLayout = (
  <ThemeWidgetBackground
    className={commonClasses}
    style={{
      background:
        'linear-gradient(270deg, rgba(0, 0, 0, 0.44), rgba(0, 0, 0, 1)',
    }}
  >
    {LightNode}
  </ThemeWidgetBackground>
);

export default ThemeWidgetBackground;
