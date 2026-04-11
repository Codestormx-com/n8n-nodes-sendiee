import { INodeProperties } from 'n8n-workflow';

export const scheduledMessageOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: { resource: ['scheduledMessage'] },
    },
    options: [
      {
        name: 'List',
        value: 'list',
        description: 'List scheduled messages (optionally filter by status)',
        action: 'List scheduled messages',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get details of a specific scheduled message',
        action: 'Get a scheduled message',
      },
      {
        name: 'Cancel',
        value: 'cancel',
        description: 'Cancel a scheduled message (only if still pending)',
        action: 'Cancel a scheduled message',
      },
    ],
    default: 'list',
  },
];

export const scheduledMessageFields: INodeProperties[] = [
  // ─── Shared: scheduleId ──────────────────────────────────────────────────
  {
    displayName: 'Schedule ID',
    name: 'scheduleId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '664abc...',
    description: 'The scheduled message ID returned when a message was scheduled.',
    displayOptions: {
      show: {
        resource: ['scheduledMessage'],
        operation: ['get', 'cancel'],
      },
    },
  },

  // ─── list: Status filter ─────────────────────────────────────────────────
  {
    displayName: 'Status Filter',
    name: 'statusFilter',
    type: 'options',
    default: '',
    description: 'Filter by message status. Leave blank to return all.',
    options: [
      { name: 'All', value: '' },
      { name: 'Scheduled', value: 'scheduled' },
      { name: 'Sent', value: 'sent' },
      { name: 'Failed', value: 'failed' },
      { name: 'Cancelled', value: 'cancelled' },
    ],
    displayOptions: {
      show: { resource: ['scheduledMessage'], operation: ['list'] },
    },
  },

  // ─── list: Pagination ────────────────────────────────────────────────────
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 1 },
    displayOptions: {
      show: { resource: ['scheduledMessage'], operation: ['list'] },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 100 },
    displayOptions: {
      show: { resource: ['scheduledMessage'], operation: ['list'] },
    },
  },
];
