import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';

export default createGlobalStyle`
  ${normalize}

  html {
    font-family: 'DejaVuSansMono', monospace, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--theme-background-primary);
    color: var(--theme-primary);

    // Colors
    --color-pepper-90: #000000;
    --color-pepper-80: #151618;
    --color-pepper-70: #1C1E21;
    --color-pepper-60: #25282C;
    --color-pepper-50: #303237;
    --color-pepper-40: #393C42;
    --color-pepper-30: #4C5057;
    --color-pepper-20: #5F646D;
    --color-pepper-10: #686E78;

    --color-salt-90: #A9ABB3;
    --color-salt-80: #B3B6BD;
    --color-salt-70: #BDC0C5;
    --color-salt-60: #C8CBD0;
    --color-salt-50: #D2D5D9;
    --color-salt-40: #DDE0E3;
    --color-salt-30: #E9EAEC;
    --color-salt-20: #F4F5F6;
    --color-salt-10: #FFFFFF;

    --color-water-90: #013B7A;
    --color-water-80: #024FA2;
    --color-water-70: #0063CC;
    --color-water-60: #0076F5;
    --color-water-50: #208BFF;
    --color-water-40: #47A0FF;
    --color-water-30: #70B5FF;
    --color-water-20: #99CAFF;
    --color-water-10: #C2DFFF;

    --color-blue-cheese-90: #017279;
    --color-blue-cheese-80: #0098A3;
    --color-blue-cheese-70: #04BECB;
    --color-blue-cheese-60: #00E4F5;
    --color-blue-cheese-50: #20F0FF;
    --color-blue-cheese-40: #46F3FF;
    --color-blue-cheese-30: #70F5FF;
    --color-blue-cheese-20: #98F8FF;
    --color-blue-cheese-10: #C2FBFF;

    --color-avocado-90: #007A3B;
    --color-avocado-80: #00A34F;
    --color-avocado-70: #00CC63;
    --color-avocado-60: #00F576;
    --color-avocado-50: #1DFF8C;
    --color-avocado-40: #47FFA0;
    --color-avocado-30: #70FFB5;
    --color-avocado-20: #99FFCA;
    --color-avocado-10: #C2FFDF;

    --color-lettuce-90: #407A01;
    --color-lettuce-80: #57A302;
    --color-lettuce-70: #6CCC00;
    --color-lettuce-60: #84F500;
    --color-lettuce-50: #96FF1E;
    --color-lettuce-40: #A8FF47;
    --color-lettuce-30: #BCFF70;
    --color-lettuce-20: #CFFF99;
    --color-lettuce-10: #E2FFC2;

    --color-cheese-90: #796601;
    --color-cheese-80: #A38802;
    --color-cheese-70: #CCAA02;
    --color-cheese-60: #F5CC03;
    --color-cheese-50: #FFDA20;
    --color-cheese-40: #FFE047;
    --color-cheese-30: #FFE770;
    --color-cheese-20: #FFEE9A;
    --color-cheese-10: #FFF5C1;

    --color-burger-90: #794100;
    --color-burger-80: #A35700;
    --color-burger-70: #CC6D00;
    --color-burger-60: #F58301;
    --color-burger-50: #FF961F;
    --color-burger-40: #FFA947;
    --color-burger-30: #FFBC70;
    --color-burger-20: #FFCF99;
    --color-burger-10: #FFE2C2;

    --color-ketchup-90: #7A0100;
    --color-ketchup-80: #A20000;
    --color-ketchup-70: #CC0000;
    --color-ketchup-60: #F50002;
    --color-ketchup-50: #FF1E1F;
    --color-ketchup-40: #FF4746;
    --color-ketchup-30: #FF7071;
    --color-ketchup-20: #FF999A;
    --color-ketchup-10: #FEC2C2;

    --color-bacon-90: #7A002F;
    --color-bacon-80: #A3003F;
    --color-bacon-70: #CC004E;
    --color-bacon-60: #F5005E;
    --color-bacon-50: #FF1F75;
    --color-bacon-40: #FF468E;
    --color-bacon-30: #FF70A7;
    --color-bacon-20: #FF99C0;
    --color-bacon-10: #FEC2D9;

    --color-cabbage-90: #4E007A;
    --color-cabbage-80: #6601A3;
    --color-cabbage-70: #8100CC;
    --color-cabbage-60: #9B01F5;
    --color-cabbage-50: #AD20FF;
    --color-cabbage-40: #BC47FF;
    --color-cabbage-30: #CB70FF;
    --color-cabbage-20: #DA98FF;
    --color-cabbage-10: #E9C2FF;

    --color-onion-90: #25007A;
    --color-onion-80: #3101A3;
    --color-onion-70: #3D00CC;
    --color-onion-60: #4801F5;
    --color-onion-50: #621FFF;
    --color-onion-40: #7E48FF;
    --color-onion-30: #9B70FF;
    --color-onion-20: #B899FF;
    --color-onion-10: #D3C3FF;
  }

  html, html.light .invert, html .invert .invert {
    --theme-background-primary: var(--color-pepper-80);
    --theme-background-highlight: var(--color-pepper-60);
    --theme-background-secondary: var(--color-pepper-70);
    --theme-primary: var(--color-salt-10);
    --theme-primary-invert: var(--color-pepper-80);
    --theme-secondary: var(--color-salt-90);
    --theme-disabled: var(--color-pepper-10);
    --theme-light: var(--color-pepper-40);
    --theme-shine: var(--color-pepper-30);
    --theme-active: #FFFFFF29;
    --theme-focus: #FFFFFF1F;
    --theme-hover: #E9EAEC14;
    --theme-separator: #F4F5F61F;

    --theme-premium: var(--color-bacon-40);
    --theme-avocado: var(--color-avocado-40);
  }

  html.light, html .invert, html.light .invert .invert {
    --theme-background-primary: var(--color-salt-30);
    --theme-background-highlight: var(--color-salt-10);
    --theme-background-secondary: var(--color-salt-20);
    --theme-primary: var(--color-pepper-80);
    --theme-primary-invert: var(--color-salt-10);
    --theme-secondary: var(--color-pepper-10);
    --theme-disabled: var(--color-salt-90);
    --theme-light: var(--color-salt-40);
    --theme-shine: var(--color-salt-50);
    --theme-active: #1516181F;
    --theme-focus: #15161814;
    --theme-hover: #25282C0A;
    --theme-separator: #15161829;

    --theme-premium: var(--color-bacon-60);
    --theme-avocado: var(--color-avocado-80);
  }
`;
