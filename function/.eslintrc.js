export default {
  env: {
    node: true, // Enable Node.js global variables
    es2021: true, // Enable modern JavaScript syntax
  },
  parserOptions: {
    ecmaVersion: 12, // Use ECMAScript 2021 syntax
    sourceType: "module", // Indicates that the code uses ES modules
  },
  extends: [
    "eslint:recommended", // Use recommended ESLint rules
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", { "allowTemplateLiterals": true }],
  },
};
