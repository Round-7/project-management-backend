import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      '.env',
      '.env.*',
      'dist/**',
      '*.log',
      'coverage/**',
      'generated/**',
      'prisma/**',
      '*.config.js'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      semi: ['error', 'never'],
      quotes: ['error', 'single']
    }
  }
)
