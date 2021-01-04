export const colorPepper90 = '#000000';
export const colorPepper80 = '#151618';
export const colorPepper60 = '#25282C';
export const colorPepper40 = '#393C42';
export const colorPepper30 = '#4C5057';
export const colorPepper10 = '#686E78';

export const colorSalt90 = '#A9ABB3';
export const colorSalt50 = '#D2D5D9';
export const colorSalt40 = '#DDE0E3';
export const colorSalt30 = '#E9EAEC';
export const colorSalt20 = '#F4F5F6';
export const colorSalt10 = '#FFFFFF';

export const colorWater90 = '#013B7A';
export const colorWater60 = '#0076F5';
export const colorWater50 = '#208BFF';
export const colorWater40 = '#47A0FF';

export const colorAvocado60 = '#00F576';
export const colorAvocado40 = '#47FFA0';

export const colorCheese50 = '#FFDA20';

export const colorKetchup40 = '#FF4746';
export const colorKetchup30 = '#FF7071';

export const colorBacon60 = '#F5005E';
export const colorBacon40 = '#FF468E';

type ColorName =
  | 'burger'
  | 'blueCheese'
  | 'avocado'
  | 'lettuce'
  | 'cheese'
  | 'bun'
  | 'ketchup'
  | 'bacon'
  | 'cabbage'
  | 'onion'
  | 'water'
  | 'salt'
  | 'pepper';
type ColorLevels = '10' | '20' | '30' | '40' | '50' | '60' | '70' | '80' | '90';
type Color = Record<ColorLevels, string>;
type ColorPalette = Record<ColorName, Color>;

const colors: ColorPalette = {
  burger: {
    '10': '#C98464',
    '20': '#C07A5B',
    '30': '#B67052',
    '40': '#AD6648',
    '50': '#A0583C',
    '60': '#914B31',
    '70': '#864129',
    '80': '#7C3822',
    '90': '#722F1B',
  },
  blueCheese: {
    '10': '#6FF1F6',
    '20': '#5CECF1',
    '30': '#45E5ED',
    '40': '#2CDCE6',
    '50': '#0DCFDC',
    '60': '#08C0CE',
    '70': '#05B5C5',
    '80': '#02AABD',
    '90': '#009FB3',
  },
  avocado: {
    '10': '#74F3BC',
    '20': '#65F1AE',
    '30': '#51EBA0',
    '40': '#39E58C',
    '50': '#1DDC6F',
    '60': '#15CE5C',
    '70': '#0FC54F',
    '80': '#0ABD42',
    '90': '#04B435',
  },
  lettuce: {
    '10': '#DBFE6C',
    '20': '#CCFB5B',
    '30': '#BDF849',
    '40': '#ACF535',
    '50': '#92F21D',
    '60': '#7DE914',
    '70': '#6FE20F',
    '80': '#62DB09',
    '90': '#58D404',
  },
  cheese: {
    '10': '#FFF76F',
    '20': '#FFF35A',
    '30': '#FFEF40',
    '40': '#FFE923',
    '50': '#FFDF00',
    '60': '#FCD400',
    '70': '#F9CC00',
    '80': '#F6C400',
    '90': '#F3BC00',
  },
  bun: {
    '10': '#FFB760',
    '20': '#FFAA55',
    '30': '#FF9D48',
    '40': '#FF8E3B',
    '50': '#FF7A2B',
    '60': '#FA6620',
    '70': '#F55919',
    '80': '#F04C11',
    '90': '#EB3F0A',
  },
  ketchup: {
    '10': '#F3796C',
    '20': '#ED685C',
    '30': '#E7574B',
    '40': '#E04337',
    '50': '#D52B20',
    '60': '#C72017',
    '70': '#BD1911',
    '80': '#B3110B',
    '90': '#A90A05',
  },
  bacon: {
    '10': '#FE7AB6',
    '20': '#FD6EA9',
    '30': '#FD619D',
    '40': '#FC538D',
    '50': '#FC4079',
    '60': '#F33163',
    '70': '#EA2654',
    '80': '#E21C48',
    '90': '#D9113A',
  },
  cabbage: {
    '10': '#E669FB',
    '20': '#E05CF8',
    '30': '#D74CF6',
    '40': '#CE3DF3',
    '50': '#C029F0',
    '60': '#AC1DE4',
    '70': '#9E15D9',
    '80': '#900DCF',
    '90': '#8505C4',
  },
  onion: {
    '10': '#9D70F8',
    '20': '#8D62F4',
    '30': '#8055F0',
    '40': '#7147ED',
    '50': '#5F37E9',
    '60': '#4E2CD7',
    '70': '#4325C8',
    '80': '#3B1EBA',
    '90': '#3319AD',
  },
  water: {
    '10': '#68A6FC',
    '20': '#5C9BFA',
    '30': '#508CF9',
    '40': '#427EF7',
    '50': '#3169F5',
    '60': '#2556ED',
    '70': '#1D49E6',
    '80': '#153CE0',
    '90': '#0D31D9',
  },
  salt: {
    '10': '#F5F8FC',
    '20': '#EDF0F7',
    '30': '#E4E9F2',
    '40': '#DBE1ED',
    '50': '#CFD6E6',
    '60': '#C2CADE',
    '70': '#B9C2D9',
    '80': '#B0BBD4',
    '90': '#A8B3CF',
  },
  pepper: {
    '10': '#525866',
    '20': '#494E5B',
    '30': '#404551',
    '40': '#383C47',
    '50': '#2D313A',
    '60': '#22262D',
    '70': '#1C1F26',
    '80': '#17191F',
    '90': '#0E1217',
  },
};

export default colors;

const overlayColor = (color: ColorName | 'white'): string =>
  color === 'white' ? '#FFFFFF' : colors[color]['50'];

export const overlayPrimary = (color: ColorName | 'white'): string =>
  `${overlayColor(color)}A3`;

export const overlaySecondary = (color: ColorName | 'white'): string =>
  `${overlayColor(color)}66`;

export const overlayTertiary = (color: ColorName | 'white'): string =>
  `${overlayColor(color)}3D`;
