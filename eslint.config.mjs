import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      "next/core-web-vitals",
      "next/typescript",
      "plugin:prettier/recommended",
      "plugin:jsx-a11y/recommended",
    ],
    plugins: ["prettier", "jsx-a11y"],
    rules: {
      "prettier/prettier": [
        "error",
        {
          trailingComma: "es5",
          tabWidth: 2,
          singleQuote: false,
          printWidth: 80,
          endOfLine: "auto",
          arrowParens: "always",
          plugins: [
            "prettier-plugin-tailwindcss",
            "@trivago/prettier-plugin-sort-imports",
          ],
          importOrder: [
            "^react$",
            "^next(/.*)?$",
            "^next-.*",
            "<THIRD_PARTY_MODULES>",
            "^@/app/(.*)$",
            "^@/components/(.*)$",
            "^@/hooks/(.*)$",
            "^@/lib/(.*)$",
            "^@/store/(.*)$",
            "^@/prisma/(.*)$",
            "^@/types/(.*)$",
            "^[./](?!.*\\.css$)",
            "\\.css$",
          ],
          importOrderSeparation: true,
          importOrderSortSpecifiers: true,
          importOrderCaseInsensitive: true,
        },
        {
          usePrettierrc: false,
        },
      ],
      "react/react-in-jsx-scope": "off",
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
    },
  }),
];

export default eslintConfig;
