module.exports = {
  root: true,
  env: { node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { project: ['./tsconfig.json'] },
  plugins: ['@typescript-eslint', 'n8n-nodes-base'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:n8n-nodes-base/community',
  ],
  rules: {
    'n8n-nodes-base/node-dirname-against-convention': 'error',
    'n8n-nodes-base/node-filename-against-convention': 'error',
    'n8n-nodes-base/cred-class-field-authenticate-missing': 'error',
    'n8n-nodes-base/cred-class-field-display-name-missing-api': 'error',
  },
};
