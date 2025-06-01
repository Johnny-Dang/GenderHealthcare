import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// --- Thêm các import của Prettier vào đây ---
import pluginPrettier from 'eslint-plugin-prettier'
import configPrettier from 'eslint-config-prettier' // Đây là object chứa các rules để tắt

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: pluginPrettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // --- Thêm các quy tắc Prettier vào đây ---
      // Tắt các quy tắc định dạng của ESLint mà Prettier sẽ xử lý
      ...configPrettier.rules,
      'prettier/prettier': 'error', // Báo lỗi nếu Prettier phát hiện vấn đề định dạng
      // ------------------------------------------

      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }], // Đổi từ 'error' sang 'warn' nếu bạn muốn nó là cảnh báo thay vì lỗi
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // --- (Tùy chọn) Thêm các quy tắc React phổ biến khác nếu bạn muốn ---
      // Ví dụ: tắt quy tắc import React vì React 17+ không yêu cầu nữa
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // -----------------------------------------------------------------
    },
    // --- Thêm settings cho React nếu bạn muốn ESLint tự động phát hiện phiên bản React ---
    settings: {
      react: {
        version: 'detect', // Tự động phát hiện phiên bản React
      },
    },
  },
]
