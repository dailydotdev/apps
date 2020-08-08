import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';
import {
  colorAvocado40,
  colorAvocado60,
  colorBacon40,
  colorBacon60,
  colorPepper10,
  colorPepper30,
  colorPepper40,
  colorPepper60,
  colorPepper70,
  colorPepper80,
  colorSalt10,
  colorSalt20,
  colorSalt30,
  colorSalt40,
  colorSalt50,
  colorSalt90,
} from '../styles/colors';

export default createGlobalStyle`
  ${normalize}

  html {
    font-family: 'DejaVuSansMono', monospace, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--theme-background-primary);
    color: var(--theme-primary);
  }

  /* stylelint-disable-next-line no-descending-specificity */
  html, html.light .invert, html .invert .invert {
    --theme-background-primary: ${colorPepper80};
    --theme-background-highlight: ${colorPepper60};
    --theme-background-secondary: ${colorPepper70};
    --theme-primary: ${colorSalt10};
    --theme-primary-invert: ${colorPepper80};
    --theme-secondary: ${colorSalt90};
    --theme-disabled: ${colorPepper10};
    --theme-light: ${colorPepper40};
    --theme-shine: ${colorPepper30};
    --theme-active: ${colorSalt10}29;
    --theme-focus: ${colorSalt10}1F;
    --theme-hover: ${colorSalt30}14;
    --theme-separator: ${colorSalt20}1F;

    --theme-premium: ${colorBacon40};
    --theme-avocado: ${colorAvocado40};
  }

  /* stylelint-disable-next-line no-descending-specificity */
  html.light, html .invert, html.light .invert .invert {
    --theme-background-primary: ${colorSalt30};
    --theme-background-highlight: ${colorSalt10};
    --theme-background-secondary: ${colorSalt20};
    --theme-primary: ${colorPepper80};
    --theme-primary-invert: ${colorSalt10};
    --theme-secondary: ${colorPepper10};
    --theme-disabled: ${colorSalt90};
    --theme-light: ${colorSalt40};
    --theme-shine: ${colorSalt50};
    --theme-active: ${colorPepper80}1F;
    --theme-focus: ${colorPepper80}14;
    --theme-hover: ${colorPepper60}0A;
    --theme-separator: ${colorPepper80}29;

    --theme-premium: ${colorBacon60};
    --theme-avocado: ${colorAvocado60};
  }

  * {
    box-sizing: border-box;
    flex-shrink: 0;
  }
`;
