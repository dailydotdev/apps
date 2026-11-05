import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import type { ProductPricingPreview } from '@dailydotdev/shared/src/graphql/paddle';
import { PlusPriceType } from '@dailydotdev/shared/src/lib/featureValues';

// Copied from production (the `products` and `pricingPreview(type: cores)`
// queries, en-US, 2026-11-05). Refresh both when the catalog changes.

const award = (
  id: string,
  name: string,
  image: string,
  value: number,
  imageGlow: string,
): Product => ({ id, type: 'award', name, image, value, flags: { imageGlow } });

const media = (path: string): string =>
  `https://media.daily.dev/image/upload/${path}`;

export const awards: Product[] = [
  award(
    'a39d7368-22d9-4e01-b961-077179ff992d',
    'Smiley Face',
    media('s--Ft4p9rjO--/f_auto/v1743664345/public/happy'),
    10,
    media('s--4sp12i70--/f_auto/v1743664360/public/HappyGlow'),
  ),
  award(
    'ef2e2633-c9b9-401a-a372-0edce9fa6329',
    'Laughing Face',
    media('s--THFmDVKR--/f_auto/v1743664345/public/Lol'),
    25,
    media('s--erb0_uML--/f_auto/v1743664360/public/LolGlow'),
  ),
  award(
    '8aeb45ce-2e96-4dbf-826d-433c98047642',
    'Heart',
    media('s--IPWhKcis--/f_auto/v1743664345/public/Love'),
    50,
    media('s--zt3wqvzq--/f_auto/v1743664360/public/LoveGlow'),
  ),
  award(
    '352f1e07-06af-4d5e-a843-b3e324a899a0',
    'Coffee Mug',
    media('s--aenMzSPZ--/f_auto/v1743664347/public/Coffee'),
    75,
    media('s--wxgfqZWc--/f_auto/v1743664360/public/CoffeeGlow'),
  ),
  award(
    '1b536ed1-3ab0-4780-a179-d0387d4c6d72',
    'Star',
    media('s--PdFJ22B8--/f_auto/v1743664345/public/Star'),
    100,
    media('s--QIKos1Qp--/f_auto/v1743664360/public/StarGlow'),
  ),
  award(
    '17432ba4-bba6-42f8-81dd-f325409e92bf',
    'Hot Dog',
    media('s--zOtftlFL--/f_auto/v1743664345/public/hotDog'),
    125,
    media('s--kCGxTta---/f_auto/v1743664360/public/hotDogGlow'),
  ),
  award(
    '1ab1bc67-78d8-4e01-be2b-c262acc27053',
    'Pizza',
    media('s--n35mhpLB--/f_auto/v1743664345/public/Pizza'),
    150,
    media('s--lCdAUh_q--/f_auto/v1743664360/public/PizzaGlow'),
  ),
  award(
    'c0d239b9-72de-4975-a1ac-97668068a310',
    'Stash of Cash',
    media('s--7SPVvVPK--/f_auto/v1743664345/public/Cash'),
    250,
    media('s--f6ygbzrB--/f_auto/v1743664360/public/CashGlow'),
  ),
  award(
    '8c0257d7-f4a3-4116-8215-21d21149bbfd',
    'Balloon Brackets',
    media('s--eJMxq8lw--/f_auto/v1747300201/public/Curly%20Brackets'),
    300,
    media('s--7J3yLxuN--/f_auto/v1747314539/public/Color%3Dglow'),
  ),
  award(
    '0951d2c8-f045-425d-aa1d-0c72a153e939',
    'Terminal',
    media('s--KBzEqo01--/f_auto/v1743664345/public/Terminal'),
    400,
    media('s--O2LYk0w3--/f_auto/v1743664360/public/TerminalGlow'),
  ),
  award(
    '7bd171f2-781f-400b-af45-1fc3bc02e7c0',
    'Rubber Duck',
    media('s--Q65Srvfv--/f_auto/v1743664345/public/Duck'),
    600,
    media('s--084HrC8k--/f_auto/v1743664360/public/DuckGlow'),
  ),
  award(
    '5efc4400-de1d-4648-b619-de67c3175b75',
    'Robotic Bug',
    media('s--wJzQYBN0--/f_auto/v1747300201/public/Bug'),
    750,
    media('s--ZUtjIO4H--/f_auto/v1747314539/public/Color%3Dglow-2'),
  ),
  award(
    '57c82004-4d6e-4a78-9010-636f1e84e74e',
    'Gaming Controller',
    media('s--IMOkH2qD--/f_auto/v1747300201/public/Controller'),
    900,
    media('s--ZtCbvpNe--/f_auto/v1747314539/public/Color%3Dglow-6'),
  ),
  award(
    'e9dab194-6d2c-409d-b422-3e51d5ed673c',
    'Keyboard',
    media('s--ezX7VAyg--/f_auto/v1743664345/public/Keyboard'),
    1200,
    media('s--NJ3uuIQw--/f_auto/v1743664360/public/KeyboardGlow'),
  ),
  award(
    '9d2131e8-d121-457a-ba9d-9281fcb9b711',
    'Shady Hacker',
    media('s--UvWxsXT5--/f_auto/v1747300201/public/Hacker'),
    1500,
    media('s--2L2VAPyF--/f_auto/v1747314539/public/Color%3Dglow-5'),
  ),
  award(
    '64af9875-b48f-4370-8bc9-a4b02b3936b8',
    'Metal Dinosaur',
    media('s--k6nu1NSe--/f_auto/v1747300201/public/Dinosaur'),
    1800,
    media('s--jdhFHO5---/f_auto/v1747314539/public/Color%3Dglow-1'),
  ),
  award(
    '99366312-6f97-4c99-b640-8cca7fe1638f',
    'Virtual Doom',
    media('s--1oNsDDV5--/f_auto/v1747300201/public/Doom'),
    2200,
    media('s--aeYEfeBa--/f_auto/v1747314539/public/Color%3Dglow-4'),
  ),
  award(
    'ad90f69b-d685-40a4-b611-057517ef91ca',
    'Funky Llama',
    media('s--YD728PdI--/f_auto/v1747300201/public/Llm'),
    2700,
    media('s--lqq1uAbj--/f_auto/v1747314539/public/Color%3Dglow-3'),
  ),
  award(
    'ae8d3e70-0358-440d-93ba-9a76fd1dc4fd',
    '"This is fine" Dog',
    media('s--eXw4JiHs--/f_auto/v1743664345/public/fineDog'),
    5000,
    media('s--NZ-1Is9I--/f_auto/v1743664360/public/fineDogGlow'),
  ),
];

const pack = (
  priceId: string,
  coresValue: number,
  amount: number,
): ProductPricingPreview => ({
  priceId,
  metadata: {
    appsId: '' as never,
    title: `${coresValue.toLocaleString('en-US')} Cores`,
    idMap: { paddle: priceId, ios: `cores_${coresValue}` },
    coresValue,
  },
  price: {
    amount,
    formatted: amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    }),
  },
  currency: { code: 'USD', symbol: '$' },
  duration: PlusPriceType.OneTime,
  coresGiveback: null,
});

export const corePacks: ProductPricingPreview[] = [
  pack('pri_01jk3bq7kdb6ng2ceazwrv0r5x', 100, 1.1),
  pack('pri_01jngmgcx8ja85j86aqyt0sjy1', 300, 3.3),
  pack('pri_01jngmh2x357gkh4sw90d4wgrk', 600, 6.6),
  pack('pri_01jngmk5kmt0kzvnzfxg4g6xs4', 1200, 13.2),
  pack('pri_01jngmp3azj5ravkd0e60bk99e', 2400, 26.4),
  pack('pri_01jngmpkb807bnn3xzmsx1psx3', 5000, 55),
  pack('pri_01jngmq70abqc01gjvmyq94n05', 8000, 88),
  pack('pri_01jngmr33nbypw09q5gmt46bnq', 12000, 132),
  pack('pri_01jngmrre6r9n1pya0788b2pye', 25000, 275),
  pack('pri_01k06qyepdm3v83bd765byq2xz', 50000, 550),
  pack('pri_01k06r0djybd9b9yvyh8rsfj71', 100000, 1100),
];
