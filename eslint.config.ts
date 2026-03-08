import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', '.next/', '.turbo/', 'supabase/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },
  {
    files: ['**/*.test.ts', '**/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  prettierConfig,
)
