import { INodeProperties } from 'n8n-workflow';

export const templateOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: { resource: ['template'] },
    },
    options: [
      {
        name: 'List',
        value: 'list',
        description: 'Retrieve all WhatsApp message templates from your Sendiee account',
        action: 'List templates',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Submit a new WhatsApp template to Meta for review (strict pre-Meta validation)',
        action: 'Create template',
      },
    ],
    default: 'list',
  },
];

export const templateFields: INodeProperties[] = [
  // ─── list: Status filter ─────────────────────────────────────────────────
  {
    displayName: 'Status',
    name: 'statusFilter',
    type: 'options',
    default: '',
    description: 'Filter templates by approval status. Leave blank to return all.',
    options: [
      { name: 'All', value: '' },
      { name: 'Approved', value: 'APPROVED' },
      { name: 'Pending', value: 'PENDING' },
      { name: 'Rejected', value: 'REJECTED' },
    ],
    displayOptions: {
      show: { resource: ['template'], operation: ['list'] },
    },
  },

  // ─── list: Category filter ───────────────────────────────────────────────
  {
    displayName: 'Category',
    name: 'categoryFilter',
    type: 'options',
    default: '',
    description: 'Filter templates by category. Leave blank to return all.',
    options: [
      { name: 'All', value: '' },
      { name: 'Authentication', value: 'authentication' },
      { name: 'Marketing', value: 'marketing' },
      { name: 'Utility', value: 'utility' },
    ],
    displayOptions: {
      show: { resource: ['template'], operation: ['list'] },
    },
  },

  // ─── create ──────────────────────────────────────────────────────────────
  {
    displayName: 'Brand Number',
    name: 'brandNumber',
    type: 'string',
    default: '',
    required: true,
    placeholder: '917012345678',
    description: 'Sender WhatsApp Business phone number',
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'order_confirmation_v2',
    description: 'Lowercase, max 512 chars: ^[a-z][a-z0-9_]*$',
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
  },
  {
    displayName: 'Language',
    name: 'language',
    type: 'string',
    default: 'en_US',
    required: true,
    placeholder: 'en_US',
    description: 'Locale code (en_US, en_GB, hi, pt_BR …)',
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
  },
  {
    displayName: 'Category',
    name: 'category',
    type: 'options',
    default: 'MARKETING',
    required: true,
    options: [
      { name: 'Marketing', value: 'MARKETING' },
      { name: 'Utility', value: 'UTILITY' },
      { name: 'Authentication', value: 'AUTHENTICATION' },
    ],
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
  },
  {
    displayName: 'Header (JSON)',
    name: 'headerJson',
    type: 'json',
    default: '{}',
    placeholder: '{"format":"IMAGE","mediaUrl":"https://cdn/banner.jpg"}',
    description: 'For MARKETING/UTILITY only. format: NONE | TEXT | IMAGE | VIDEO | DOCUMENT. For media: pass mediaUrl (we upload) or mediaHandle (pre-uploaded).',
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
  },
  {
    displayName: 'Body (JSON)',
    name: 'bodyJson',
    type: 'json',
    default: '{}',
    placeholder: '{"text":"Hi {{1}}","exampleVariables":["Surya"]}',
    description: 'For MARKETING/UTILITY only. text up to 1024 chars; variables must be sequential {{1}},{{2}}…',
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
  },
  {
    displayName: 'Footer (JSON)',
    name: 'footerJson',
    type: 'json',
    default: '{}',
    placeholder: '{"text":"Powered by Acme"}',
    description: 'Optional. ≤60 chars, no variables.',
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
  },
  {
    displayName: 'Buttons (JSON)',
    name: 'buttonsJson',
    type: 'json',
    default: '[]',
    placeholder: '[{"type":"QUICK_REPLY","text":"Track"}]',
    description: 'Optional. ≤10 total. Per-type caps: URL ≤ 2, PHONE_NUMBER ≤ 1, COPY_CODE ≤ 1.',
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
  },
  {
    displayName: 'Auth (JSON)',
    name: 'authJson',
    type: 'json',
    default: '{}',
    placeholder: '{"otp_type":"COPY_CODE","add_security_recommendation":true,"code_expiration_minutes":10}',
    description: 'Required for category=AUTHENTICATION. otp_type: COPY_CODE | ONE_TAP | ZERO_TAP.',
    displayOptions: {
      show: { resource: ['template'], operation: ['create'], category: ['AUTHENTICATION'] },
    },
  },
];
