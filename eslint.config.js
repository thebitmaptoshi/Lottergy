// Flat ESLint config for packages/* and scripts/*.
// apps/lottergy/ keeps its bundled eslint-config-expo separately.

import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/node_modules/**",
      "**/.expo/**",
      "**/coverage/**",
      "apps/**",
      "powerball-legacy/**",
    ],
  },
  ...tseslint.configs.recommended,
);
