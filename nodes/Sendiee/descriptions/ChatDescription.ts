import { INodeProperties } from 'n8n-workflow';

export const chatOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['chat'] } },
    options: [
      {
        name: 'Get History',
        value: 'getHistory',
        action: 'Get chat history',
        description: 'Fetch the message history for a contact (cursor-paginated, newest first)',
      },
      {
        name: 'List Conversations',
        value: 'listConversations',
        action: 'List conversations',
        description: 'Inbox-style list sorted by most recent activity',
      },
    ],
    default: 'getHistory',
  },
];

export const chatFields: INodeProperties[] = [
  // ─── getHistory ───────────────────────────────────────────────────────
  {
    displayName: 'Phone',
    name: 'phone',
    type: 'string',
    default: '',
    placeholder: '919876543210',
    description: 'Recipient phone in international format. Provide either this OR Contact ID.',
    displayOptions: { show: { resource: ['chat'], operation: ['getHistory'] } },
  },
  {
    displayName: 'Contact ID',
    name: 'contactId',
    type: 'string',
    default: '',
    description: 'Sendiee Contact ID. Provide either this OR Phone.',
    displayOptions: { show: { resource: ['chat'], operation: ['getHistory'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 20,
    description: 'How many messages to return (1–100)',
    typeOptions: { minValue: 1, maxValue: 100 },
    displayOptions: { show: { resource: ['chat'], operation: ['getHistory'] } },
  },
  {
    displayName: 'Before (ISO date)',
    name: 'before',
    type: 'string',
    default: '',
    placeholder: '2026-04-29T05:18:00.000Z',
    description: 'Cursor — return messages older than this timestamp. Use the previous response\'s pagination.nextCursor.',
    displayOptions: { show: { resource: ['chat'], operation: ['getHistory'] } },
  },

  // ─── listConversations ────────────────────────────────────────────────
  {
    displayName: 'Brand Number',
    name: 'brandNumber',
    type: 'string',
    default: '',
    description: 'Optional: filter to conversations on this brand number',
    displayOptions: { show: { resource: ['chat'], operation: ['listConversations'] } },
  },
  {
    displayName: 'Archived',
    name: 'archived',
    type: 'options',
    default: '',
    options: [
      { name: 'All', value: '' },
      { name: 'Only Archived', value: 'true' },
      { name: 'Only Active', value: 'false' },
    ],
    displayOptions: { show: { resource: ['chat'], operation: ['listConversations'] } },
  },
  {
    displayName: 'Search',
    name: 'search',
    type: 'string',
    default: '',
    description: 'Case-insensitive match on phone, contact name, or last message',
    displayOptions: { show: { resource: ['chat'], operation: ['listConversations'] } },
  },
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 1 },
    displayOptions: { show: { resource: ['chat'], operation: ['listConversations'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 20,
    typeOptions: { minValue: 1, maxValue: 100 },
    displayOptions: { show: { resource: ['chat'], operation: ['listConversations'] } },
  },
];
