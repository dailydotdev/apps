export enum ColorName {
  Burger = 'burger',
  BlueCheese = 'blueCheese',
  Avocado = 'avocado',
  Lettuce = 'lettuce',
  Cheese = 'cheese',
  Bun = 'bun',
  Ketchup = 'ketchup',
  Bacon = 'bacon',
  Cabbage = 'cabbage',
  Onion = 'onion',
  Water = 'water',
  Salt = 'salt',
  Pepper = 'pepper',
  Twitter = 'twitter',
  WhatsApp = 'whatsapp',
  Facebook = 'facebook',
  Reddit = 'reddit',
  LinkedIn = 'linkedin',
  Telegram = 'telegram',
}

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
  twitter: {
    '10': '#37BBF6',
    '20': '#37BBF6',
    '30': '#27AFF5',
    '40': '#1DA0F2',
    '50': '#1DA0F2',
    '60': '#1DA0F2',
    '70': '#158EEA',
    '80': '#158EEA',
    '90': '#0F7FDE',
  },
  whatsapp: {
    '10': '#3AC956',
    '20': '#3AC956',
    '30': '#2ABE45',
    '40': '#20B038',
    '50': '#20B038',
    '60': '#20B038',
    '70': '#189F2C',
    '80': '#189F2C',
    '90': '#119023',
  },
  facebook: {
    '10': '#5979B5',
    '20': '#5979B5',
    '30': '#4969A7',
    '40': '#3B5998',
    '50': '#3B5998',
    '60': '#3B5998',
    '70': '#2E4886',
    '80': '#2E4886',
    '90': '#253B76',
  },
  reddit: {
    '10': '#FF4500',
    '20': '#FF4500',
    '30': '#FF4500',
    '40': '#FF4500',
    '50': '#FF4500',
    '60': '#FF4500',
    '70': '#FF4500',
    '80': '#FF4500',
    '90': '#FF4500',
  },
  linkedin: {
    '10': '#0077B5',
    '20': '#0077B5',
    '30': '#0077B5',
    '40': '#0077B5',
    '50': '#0077B5',
    '60': '#0077B5',
    '70': '#0077B5',
    '80': '#0077B5',
    '90': '#0077B5',
  },
  telegram: {
    '10': '#24A2E0',
    '20': '#24A2E0',
    '30': '#24A2E0',
    '40': '#24A2E0',
    '50': '#24A2E0',
    '60': '#24A2E0',
    '70': '#24A2E0',
    '80': '#24A2E0',
    '90': '#24A2E0',
  },
};

export default colors;
