/* eslint-disable import/no-commonjs */

module.exports = {
  extends: [
    'syndrobox/lib/mocha',
  ],
  globals: {
    _: true,
    chai: true,
    expect: true,
    sinon: true,
    sandbox: true,
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
  },
};
