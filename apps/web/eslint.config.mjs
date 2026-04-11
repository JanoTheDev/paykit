import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Flat config for @paylix/web. Mirrors what create-next-app@15 generates so
// it stays in sync with what `next lint` was trying to do before it was
// deprecated. See https://nextjs.org/docs/app/api-reference/config/eslint
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Standard convention: prefix intentionally unused vars/args with _.
      // Without this the eslint-config-next default complains about every
      // `const { a, _b } = x` destructure and every `function(_req, res)` handler.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
