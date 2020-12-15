import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';
import {
  colorAvocado40,
  colorAvocado60,
  colorBacon40,
  colorBacon60,
  colorBlueCheese50,
  colorBlueCheese60,
  colorBurger40,
  colorBurger60,
  colorBurger80,
  colorBurger90,
  colorCabbage40,
  colorCabbage60,
  colorCheese40,
  colorCheese60,
  colorOnion40,
  colorOnion60,
  colorPepper10,
  colorPepper30,
  colorPepper40,
  colorPepper60,
  colorPepper70,
  colorPepper80,
  colorPepper90,
  colorSalt10,
  colorSalt20,
  colorSalt30,
  colorSalt40,
  colorSalt50,
  colorSalt80,
  colorSalt90,
  colorWater50,
  colorWater60,
} from '../styles/colors';
import { mobileL } from '../styles/media';

export default createGlobalStyle`
  ${normalize}

  @font-face {
    font-family: DejaVuSansMono;
    font-display: swap;
    src: local('DejaVuSansMono'),url(https://storage.googleapis.com/devkit-assets/static/fonts/DejaVuSansMono.woff2) format("woff2"), url(https://storage.googleapis.com/devkit-assets/static/fonts/DejaVuSansMono.woff) format("woff")
  }

  @font-face {
    font-family: DejaVuSansMono;
    font-display: swap;
    src: local('DejaVuSansMono-Oblique'),url(https://storage.googleapis.com/devkit-assets/static/fonts/DejaVuSansMono-Oblique.woff2) format("woff2"),url(https://storage.googleapis.com/devkit-assets/static/fonts/DejaVuSansMono-Oblique.woff) format("woff");
    font-style: italic;
  }

  html {
    font-family: 'DejaVuSansMono', monospace, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--theme-background-primary);
    color: var(--theme-primary);
  }

  body {
    min-width: 20rem;
    overflow-y: scroll;
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
    --theme-backdrop: ${colorSalt10}3D;

    --theme-premium: ${colorBacon40};
    --theme-avocado: ${colorAvocado40};

    --theme-rank-1-color: ${colorBurger40};
    --theme-rank-1-color-top: ${colorBurger40};
    --theme-rank-1-color-bottom: ${colorBurger80};

    --theme-rank-2-color: ${colorSalt40};
    --theme-rank-2-color-top: ${colorSalt40};
    --theme-rank-2-color-bottom: ${colorSalt80};

    --theme-rank-3-color: ${colorCheese40};
    --theme-rank-3-color-top: ${colorCheese40};
    --theme-rank-3-color-bottom: ${colorBurger40};

    --theme-rank-4-color: ${colorBlueCheese50};
    --theme-rank-4-color-top: ${colorBlueCheese50};
    --theme-rank-4-color-bottom: ${colorWater50};

    --theme-rank-5-color: ${colorCabbage40};
    --theme-rank-5-color-top: ${colorCabbage40};
    --theme-rank-5-color-bottom: ${colorOnion40};
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
    --theme-backdrop: ${colorPepper90}3D;

    --theme-premium: ${colorBacon60};
    --theme-avocado: ${colorAvocado60};

    --theme-rank-1-color: ${colorBurger60};
    --theme-rank-1-color-top: ${colorBurger60};
    --theme-rank-1-color-bottom: ${colorBurger90};

    --theme-rank-2-color: ${colorPepper60};
    --theme-rank-2-color-top: ${colorPepper60};
    --theme-rank-2-color-bottom: ${colorPepper10};

    --theme-rank-3-color: ${colorCheese60};
    --theme-rank-3-color-top: ${colorCheese60};
    --theme-rank-3-color-bottom: ${colorBurger60};

    --theme-rank-4-color: ${colorBlueCheese60};
    --theme-rank-4-color-top: ${colorBlueCheese60};
    --theme-rank-4-color-bottom: ${colorWater60};

    --theme-rank-5-color: ${colorCabbage60};
    --theme-rank-5-color-top: ${colorCabbage60};
    --theme-rank-5-color-bottom: ${colorOnion60};
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
