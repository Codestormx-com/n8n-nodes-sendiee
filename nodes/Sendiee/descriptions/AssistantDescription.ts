import { INodeProperties } from 'n8n-workflow';

/**
 * Minimal Assistants surface for n8n. Full create/update/restore/history
 * lives in the dashboard or sendiee-mcp (the AI agent uses MCP for setup).
 * Workflows typically only need to list / pause / resume an assistant.
 */
export const assistantOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['assistant'] } },
    options: [
      {
        name: 'List',
        value: 'list',
        action: 'List assistants',
        description: 'List AI assistants for the org with optional filters',
      },
      {
        name: 'Toggle',
        value: 'toggle',
        action: 'Enable / disable assistant',
        description: 'Quickly enable or disable an assistant (e.g. on holiday)',
      },
    ],
    default: 'list',
  },
];

export const assistantFields: INodeProperties[] = [
  // ─── List filters ────────────────────────────────────────────────────
  {
    displayName: 'Platform',
    name: 'platformFilter',
    type: 'options',
    default: '',
    options: [
      { name: 'All', value: '' },
      { name: 'WhatsApp', value: 'whatsapp' },
      { name: 'Instagram', value: 'instagram' },
      { name: 'Messenger', value: 'messenger' },
    ],
    displayOptions: { show: { resource: ['assistant'], operation: ['list'] } },
  },
  {
    displayName: 'Active Filter',
    name: 'isActiveFilter',
    type: 'options',
    default: '',
    options: [
      { name: 'All', value: '' },
      { name: 'Only Active', value: 'true' },
      { name: 'Only Inactive', value: 'false' },
    ],
    displayOptions: { show: { resource: ['assistant'], operation: ['list'] } },
  },
  {
    displayName: 'Connected Filter',
    name: 'isConnectedFilter',
    type: 'options',
    default: '',
    options: [
      { name: 'All', value: '' },
      { name: 'Only Connected', value: 'true' },
      { name: 'Only Unconnected', value: 'false' },
    ],
    displayOptions: { show: { resource: ['assistant'], operation: ['list'] } },
  },
  {
    displayName: 'Name (substring)',
    name: 'nameFilter',
    type: 'string',
    default: '',
    displayOptions: { show: { resource: ['assistant'], operation: ['list'] } },
  },

  // ─── Toggle ──────────────────────────────────────────────────────────
  {
    displayName: 'Assistant',
    name: 'modelId',
    type: 'options',
    default: '',
    required: true,
    description: 'Pick an assistant — populated dynamically from your account',
    typeOptions: { loadOptionsMethod: 'getAssistants' },
    displayOptions: { show: { resource: ['assistant'], operation: ['toggle'] } },
  },
  {
    displayName: 'Active',
    name: 'isActive',
    type: 'boolean',
    default: true,
    description: 'true to enable, false to disable',
    displayOptions: { show: { resource: ['assistant'], operation: ['toggle'] } },
  },
];
