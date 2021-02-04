/* eslint-disable @typescript-eslint/no-var-requires */
const { replaceMacro } = require('./common');

const BASE_SIZE = 16;
const UNITS = 'rem';

module.exports = replaceMacro((arg) => `${arg / BASE_SIZE}${UNITS}`);
