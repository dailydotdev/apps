import classNames from 'classnames';
import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import classed from '../../lib/classed';
import { DailyIcon } from '../icons';

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
      className={classNames(
        'h-full bg-gradient-to-l from-[#C73EF407] to-[#3C44FF]',
        className,
      )}
      style={{
        ...style,
        paddingLeft: '28px',
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
    className="bg-gradient-to-l from-[#00000044] to-[#000000]"
    style={{ boxShadow: '-8px -8px 22px #00000040' }}
  >
    <DailyIcon className="h-3 w-6" style={{ fill: '#FFFFFF' }} />
  </NodeContainer>
);

export const DarkNodeLayout = (
  <ThemeWidgetBackground className={commonClasses}>
    {DarkNode}
  </ThemeWidgetBackground>
);

export const LightNode = (
  <NodeContainer
    className="bg-gradient-to-l from-[#FFFFFF44] to-[#FFFFFF]"
    style={{ boxShadow: '-8px -8px 22px #FFFFFF40' }}
  >
    <DailyIcon className="h-3 w-6" style={{ fill: '#000000' }} />
  </NodeContainer>
);

export const LightNodeLayout = (
  <ThemeWidgetBackground className={commonClasses}>
    {LightNode}
  </ThemeWidgetBackground>
);

export default ThemeWidgetBackground;
