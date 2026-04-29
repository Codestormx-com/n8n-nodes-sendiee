import { INodeProperties } from 'n8n-workflow';

export const campaignOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['campaign'] } },
    options: [
      {
        name: 'Preview Audience',
        value: 'preview',
        action: 'Preview campaign audience',
        description: 'Resolve audience size + sample without creating a campaign. Always preview first.',
      },
      {
        name: 'Create',
        value: 'create',
        action: 'Create campaign',
        description: 'Send (or schedule) a template campaign to segments / tags / a raw contact list',
      },
      {
        name: 'List',
        value: 'list',
        action: 'List campaigns',
        description: 'Paginated list of campaigns with summary counters',
      },
      {
        name: 'Get Report',
        value: 'report',
        action: 'Get campaign report',
        description: 'Full delivery + engagement + cost report for one campaign',
      },
    ],
    default: 'preview',
  },
];

// Shared brandNumber field
const brandNumberField: INodeProperties = {
  displayName: 'Brand Number',
  name: 'brandNumber',
  type: 'string',
  default: '',
  required: true,
  placeholder: '917012345678',
  description: 'Your WhatsApp Business phone number. Falls back to credentials when blank.',
  displayOptions: { show: { resource: ['campaign'], operation: ['preview', 'create'] } },
};

// Shared audience builder used for both preview and create
const audienceFields: INodeProperties[] = [
  {
    displayName: 'Audience Mode',
    name: 'audienceMode',
    type: 'options',
    default: 'segment',
    description: 'Choose how to target recipients. Segment-mode and raw-contact mode are mutually exclusive.',
    options: [
      { name: 'Segments / Tags / Filters', value: 'segment' },
      { name: 'Raw Contacts List', value: 'raw' },
    ],
    displayOptions: { show: { resource: ['campaign'], operation: ['preview', 'create'] } },
  },

  // Segment mode
  {
    displayName: 'Tags',
    name: 'tags',
    type: 'multiOptions',
    typeOptions: { loadOptionsMethod: 'getTags' },
    default: [],
    description: 'Include contacts that have any of these tags',
    displayOptions: {
      show: { resource: ['campaign'], operation: ['preview', 'create'], audienceMode: ['segment'] },
    },
  },
  {
    displayName: 'Exclude Tags',
    name: 'excludeTags',
    type: 'multiOptions',
    typeOptions: { loadOptionsMethod: 'getTags' },
    default: [],
    description: 'Exclude contacts with any of these tags',
    displayOptions: {
      show: { resource: ['campaign'], operation: ['preview', 'create'], audienceMode: ['segment'] },
    },
  },
  {
    displayName: 'Additional Filters',
    name: 'filtersJson',
    type: 'json',
    default: '{}',
    description: 'Optional advanced filter object. Example: {"hasEmail": true, "optedOut": false}',
    displayOptions: {
      show: { resource: ['campaign'], operation: ['preview', 'create'], audienceMode: ['segment'] },
    },
  },

  // Raw mode
  {
    displayName: 'Contacts (JSON Array)',
    name: 'contactsJson',
    type: 'json',
    default: '[]',
    placeholder: '[{"phone": "919876543210", "name": "Surya"}]',
    description: 'Array of contacts. Each item: { phone, name?, email?, custom? }. Phones are upserted into your Contact directory.',
    displayOptions: {
      show: { resource: ['campaign'], operation: ['preview', 'create'], audienceMode: ['raw'] },
    },
  },
];

export const campaignFields: INodeProperties[] = [
  brandNumberField,

  // ─── Create-only top fields ──────────────────────────────────────────
  {
    displayName: 'Campaign Name',
    name: 'campaignName',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'Diwali sale 2026',
    displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
  },
  {
    displayName: 'Template',
    name: 'templateName',
    type: 'options',
    default: '',
    required: true,
    description: 'APPROVED templates only — populated dynamically from your account',
    typeOptions: { loadOptionsMethod: 'getTemplates' },
    displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
  },
  {
    displayName: 'Language',
    name: 'language',
    type: 'string',
    default: 'en_US',
    description: 'Locale code that pairs with the template (e.g. en_US, hi)',
    displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
  },
  {
    displayName: 'Variables (JSON)',
    name: 'variablesJson',
    type: 'json',
    default: '{}',
    placeholder: '{"header":{"mediaUrl":"https://..."},"body":["Surya","ORD-123"]}',
    description: 'Variable payload — see /docs/campaigns/create. Header media + body[] + buttons[].',
    displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
  },
  {
    displayName: 'Schedule (ISO + timezone)',
    name: 'scheduleEnabled',
    type: 'boolean',
    default: false,
    description: 'Schedule for future delivery instead of sending immediately',
    displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
  },
  {
    displayName: 'Send At (ISO 8601)',
    name: 'scheduleSendAt',
    type: 'string',
    default: '',
    placeholder: '2026-05-01T10:00:00',
    displayOptions: {
      show: { resource: ['campaign'], operation: ['create'], scheduleEnabled: [true] },
    },
  },
  {
    displayName: 'Timezone',
    name: 'scheduleTimezone',
    type: 'string',
    default: 'UTC',
    placeholder: 'Asia/Kolkata',
    displayOptions: {
      show: { resource: ['campaign'], operation: ['create'], scheduleEnabled: [true] },
    },
  },

  ...audienceFields,

  // ─── List filters ────────────────────────────────────────────────────
  {
    displayName: 'Status',
    name: 'statusFilter',
    type: 'options',
    default: '',
    options: [
      { name: 'All', value: '' },
      { name: 'Draft', value: 'draft' },
      { name: 'Scheduled', value: 'scheduled' },
      { name: 'Processing', value: 'processing' },
      { name: 'Completed', value: 'completed' },
      { name: 'Failed', value: 'failed' },
      { name: 'Paused', value: 'paused' },
      { name: 'Cancelled', value: 'cancelled' },
    ],
    displayOptions: { show: { resource: ['campaign'], operation: ['list'] } },
  },
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 1 },
    displayOptions: { show: { resource: ['campaign'], operation: ['list'] } },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 20,
    typeOptions: { minValue: 1, maxValue: 100 },
    displayOptions: { show: { resource: ['campaign'], operation: ['list'] } },
  },

  // ─── Report ──────────────────────────────────────────────────────────
  {
    displayName: 'Campaign',
    name: 'campaignId',
    type: 'options',
    default: '',
    required: true,
    description: 'Pick a campaign — populated dynamically',
    typeOptions: { loadOptionsMethod: 'getCampaigns' },
    displayOptions: { show: { resource: ['campaign'], operation: ['report'] } },
  },
];
