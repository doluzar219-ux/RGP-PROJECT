import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // ——— global settings ———
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      "node_modules/**",
      "*.min.js",
      ".env*",
      "public/vendor/**",
    ],
  },

  // ——— baseline: recommended JS + TS rules for everything we own ———
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // ——— React source files ———
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // ---- correctness (errors) -------------------------------------------
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-render": "error",
      "react-hooks/purity": "error",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // ---- house style (warnings) -----------------------------------------
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_|^ignore",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "info", "table"] }],
    },
  },

  // ——— Node-flavoured config files (vite.config.ts, eslint.config.js) ———
  {
    files: ["*.config.{js,mjs,cjs,ts}", "scripts/**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
    },
  },
);
