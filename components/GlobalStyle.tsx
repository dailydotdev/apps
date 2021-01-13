import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';
import colors, {
  colorAvocado40,
  colorAvocado60,
  colorBacon40,
  colorBacon60,
  colorPepper10,
  colorPepper30,
  colorPepper40,
  colorPepper60,
  colorPepper80,
  colorPepper90,
  colorSalt10,
  colorSalt20,
  colorSalt30,
  colorSalt40,
  colorSalt50,
  colorSalt90,
} from '../styles/colors';
import { mobileL } from '../styles/media';
import { shadow2, shadow3 } from '../styles/shadows';

export default createGlobalStyle`
  ${normalize}

  html {
    font-family: -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Ubuntu, Segoe UI, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--theme-background-primary);
    color: var(--theme-label-primary);
  }

  body {
    min-width: 20rem;
    overflow-y: scroll;
  }

  /* stylelint-disable-next-line no-descending-specificity */
  html, html.light .invert, html .invert .invert {
    --theme-background-highlight: ${colorPepper60};
    --theme-primary: ${colorSalt10};
    --theme-primary-invert: ${colorPepper80};
    --theme-secondary: ${colorSalt90};
    --theme-disabled: ${colorPepper10};
    --theme-light: ${colorPepper40};
    --theme-shine: ${colorPepper30};
    --theme-active: ${colorSalt10}29;
    --theme-hover: ${colorSalt30}14;
    --theme-separator: ${colorSalt20}1F;
    --theme-backdrop: ${colorSalt10}3D;

    --theme-premium: ${colorBacon40};
    --theme-avocado: ${colorAvocado40};

    --theme-focus: ${colors.blueCheese['40']};

    --theme-background-primary: ${colors.pepper['90']};
    --theme-background-secondary: ${colors.pepper['70']};
    --theme-background-tertiary: ${colors.pepper['80']};

    --theme-label-primary: #FFFFFF;
    --theme-label-secondary: ${colors.salt['50']};
    --theme-label-tertiary: ${colors.salt['90']};
    --theme-label-quaternary: ${colors.salt['90']}A3;
    --theme-label-disabled: ${colors.salt['90']}52;
    --theme-label-link: ${colors.water['20']};
    --theme-label-invert: ${colors.pepper['90']};

    --theme-divider-primary: ${colors.salt['90']};
    --theme-divider-secondary: ${colors.salt['90']}66;
    --theme-divider-tertiary: ${colors.salt['90']}33;

    --theme-status-error: ${colors.ketchup['40']};
    --theme-status-help: ${colors.cheese['40']};
    --theme-status-success: ${colors.avocado['40']};

    --theme-shadow2: ${shadow2('#00000066')};
    --theme-shadow3: ${shadow3('#000000A3')};

    --theme-rank-1-color: ${colors.burger['40']};
    --theme-rank-1-color-top: ${colors.burger['40']};
    --theme-rank-1-color-bottom: ${colors.bun['40']};

    --theme-rank-2-color: ${colors.salt['40']};
    --theme-rank-2-color-top: #FFFFFF;
    --theme-rank-2-color-bottom: ${colors.salt['40']};

    --theme-rank-3-color: ${colors.cheese['40']};
    --theme-rank-3-color-top: ${colors.cheese['40']};
    --theme-rank-3-color-bottom: ${colors.bun['40']};

    --theme-rank-4-color: ${colors.blueCheese['40']};
    --theme-rank-4-color-top: ${colors.water['40']};
    --theme-rank-4-color-bottom: ${colors.blueCheese['40']};

    --theme-rank-5-color: ${colors.cabbage['40']};
    --theme-rank-5-color-top: ${colors.cabbage['40']};
    --theme-rank-5-color-bottom: ${colors.onion['40']};
  }

  /* stylelint-disable-next-line no-descending-specificity */
  html.light, html .invert, html.light .invert .invert {
    --theme-background-highlight: ${colorSalt10};
    --theme-primary: ${colorPepper80};
    --theme-primary-invert: ${colorSalt10};
    --theme-secondary: ${colorPepper10};
    --theme-disabled: ${colorSalt90};
    --theme-light: ${colorSalt40};
    --theme-shine: ${colorSalt50};
    --theme-active: ${colorPepper80}1F;
    --theme-hover: ${colorPepper60}0A;
    --theme-separator: ${colorPepper80}29;
    --theme-backdrop: ${colorPepper90}3D;

    --theme-premium: ${colorBacon60};
    --theme-avocado: ${colorAvocado60};

    --theme-focus: ${colors.blueCheese['60']};

    --theme-background-primary: #FFFFFF;
    --theme-background-secondary: ${colors.salt['10']};
    --theme-background-tertiary: ${colors.salt['20']};

    --theme-label-primary: ${colors.pepper['90']};
    --theme-label-secondary: ${colors.pepper['50']};
    --theme-label-tertiary: ${colors.pepper['10']};
    --theme-label-quaternary: ${colors.pepper['10']}A3;
    --theme-label-disabled: ${colors.pepper['10']}52;
    --theme-label-link: ${colors.water['80']};
    --theme-label-invert: #FFFFFF;

    --theme-divider-primary: ${colors.pepper['10']};
    --theme-divider-secondary: ${colors.pepper['10']}66;
    --theme-divider-tertiary: ${colors.pepper['10']}33;

    --theme-status-error: ${colors.ketchup['60']};
    --theme-status-help: ${colors.cheese['60']};
    --theme-status-success: ${colors.avocado['60']};

    --theme-shadow2: 0 0.375rem 0.375rem -0.125rem ${colors.salt['90']}66;
    --theme-shadow3: 0 0.875rem 0.875rem -0.375rem ${colors.salt['90']}A3;

    --theme-rank-1-color: ${colors.burger['60']};
    --theme-rank-1-color-top: ${colors.burger['60']};
    --theme-rank-1-color-bottom: ${colors.bun['60']};

    --theme-rank-2-color: ${colors.pepper['60']};
    --theme-rank-2-color-top: ${colors.salt['90']};
    --theme-rank-2-color-bottom: ${colors.pepper['60']};

    --theme-rank-3-color: ${colors.cheese['60']};
    --theme-rank-3-color-top: ${colors.cheese['60']};
    --theme-rank-3-color-bottom: ${colors.bun['60']};

    --theme-rank-4-color: ${colors.blueCheese['60']};
    --theme-rank-4-color-top: ${colors.water['60']};
    --theme-rank-4-color-bottom: ${colors.blueCheese['60']};

    --theme-rank-5-color: ${colors.cabbage['60']};
    --theme-rank-5-color-top: ${colors.cabbage['60']};
    --theme-rank-5-color-bottom: ${colors.onion['60']};
  }

  * {
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .logo {
    width: 4.313rem;
  }

  .ReactModal__Body--open .hide-on-modal {
    display: none;

    ${mobileL} {
      display: block;
    }
  }
`;
