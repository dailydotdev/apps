/* eslint-disable @typescript-eslint/no-var-requires */
const { replaceMacro } = require('./common');

const BASE_SIZE = 0.25;
const UNITS = 'rem';

module.exports = replaceMacro((arg) => `${arg * BASE_SIZE}${UNITS}`);
