// stylelint.config.js
module.exports = {
  extends: [
    "stylelint-config-recommended",
    "stylelint-config-tailwindcss"
  ],
  overrides: [
    {
      files: ["**/*.css"],
      customSyntax: "postcss-css"         
    }
  ]
};
