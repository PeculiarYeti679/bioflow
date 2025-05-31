// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// 1️⃣ Resolve __dirname in ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 2️⃣ Instantiate FlatCompat so we can pull in Next.js’s recommended configs:
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// 3️⃣ Import the “eslint-plugin-unused-imports” plugin itself:
import unusedImportsPlugin from "eslint-plugin-unused-imports";

export default [
  // ─────────────────────────────────────────────────────────────────────────────
  // 4️⃣  Spread Next.js core-web-vitals + Next.js TypeScript presets
  //      (this is exactly what “extends: [ 'next/core-web-vitals', 'next/typescript' ]” does
  //       if you were using a .eslintrc).  FlatCompat returns an array of config objects.
  // ─────────────────────────────────────────────────────────────────────────────
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ─────────────────────────────────────────────────────────────────────────────
  // 5️⃣  Our custom ruleset entry:
  //     •  Plug in “unused-imports” so ESLint can call its rules.
  //     •  Turn off ESLint’s built-in `no-unused-vars` (and TS variant),
  //        otherwise they will conflict.
  //     •  Turn on “unused-imports/no-unused-imports” as an ERROR
  //        (so imports are physically removed on --fix).
  //     •  Optionally, we can also warn on unused variables (not just imports).
  // ─────────────────────────────────────────────────────────────────────────────
  {
    // Name your plugin (the key is what you’ll prefix in “rules”)
    plugins: {
      // “unused-imports” must exactly match the plugin name you npm-installed.
      "unused-imports": unusedImportsPlugin,
    },

    rules: {
      // ─────────────────────────────────────────────────────────────────────────
      //  Disable built-in “no-unused-vars” checks in ESLint & TS:
      // ─────────────────────────────────────────────────────────────────────────
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // ─────────────────────────────────────────────────────────────────────────
      //  Enable the plugin rule that will delete unused import statements.
      //  When you run `eslint --fix`, any import that isn’t used anywhere
      //  in that file will be removed.
      // ─────────────────────────────────────────────────────────────────────────
      "unused-imports/no-unused-imports": "error",

      // ─────────────────────────────────────────────────────────────────────────
      //  (Optional) Warn about unused variables (so you can catch things like
      //   unused function parameters or let-bound names).  Feel free to tweak.
      // ─────────────────────────────────────────────────────────────────────────
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_", // allow “_foo” style unused variables
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // ─────────────────────────────────────────────────────────────────────────
      //  If you have any other custom ESLint rules, add them here.
      // ─────────────────────────────────────────────────────────────────────────
      // e.g.
      // "react/react-in-jsx-scope": "off",
      // "prettier/prettier": "error",
      // etc.
    },
  },
];
