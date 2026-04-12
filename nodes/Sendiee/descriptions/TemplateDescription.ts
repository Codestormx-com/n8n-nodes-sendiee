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
];
