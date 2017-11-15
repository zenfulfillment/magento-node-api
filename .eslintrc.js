module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import",
    "mocha"
  ],
  "env": {
    "mocha": true
  },
  "rules": {
    "indent": ["error", 2],
    "object-curly-spacing": ["error", "never"],
    "array-bracket-spacing": ["error", "never"],
    "comma-dangle": ["error", "never"],
    "no-use-before-define": ["error", {"functions": false}],
    "arrow-parens": ["error", "always"],
    "func-names": ["error", "as-needed"],
    "max-len": ["error", {"code": 120, "ignoreComments": true}],
    "mocha/no-exclusive-tests": "error",
    "no-underscore-dangle": 0,
  }
};
