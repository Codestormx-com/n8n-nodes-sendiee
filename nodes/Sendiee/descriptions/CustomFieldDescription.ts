import { INodeProperties } from 'n8n-workflow';

export const customFieldOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['customField'] } },
    options: [
      { name: 'List', value: 'list', action: 'List custom fields' },
      { name: 'Create', value: 'create', action: 'Create custom field' },
      { name: 'Update', value: 'update', action: 'Update custom field' },
      { name: 'Delete', value: 'delete', action: 'Delete custom field' },
    ],
    default: 'list',
  },
];

export const customFieldFields: INodeProperties[] = [
  // create + update common: fieldName
  {
    displayName: 'Field Name',
    name: 'fieldName',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'Loyalty Tier',
    description: 'Human-readable name shown in the dashboard',
    displayOptions: { show: { resource: ['customField'], operation: ['create', 'update'] } },
  },
  {
    displayName: 'Field Key',
    name: 'fieldKey',
    type: 'string',
    default: '',
    placeholder: 'loyalty_tier',
    description: 'Programmatic key — immutable after creation. Auto-derived from fieldName when blank.',
    displayOptions: { show: { resource: ['customField'], operation: ['create'] } },
  },
  {
    displayName: 'Field Type',
    name: 'fieldType',
    type: 'options',
    default: 'text',
    options: [
      { name: 'Text', value: 'text' },
      { name: 'Number', value: 'number' },
      { name: 'Date', value: 'date' },
      { name: 'Boolean', value: 'boolean' },
      { name: 'Dropdown', value: 'dropdown' },
    ],
    displayOptions: { show: { resource: ['customField'], operation: ['create', 'update'] } },
  },
  {
    displayName: 'Dropdown Options',
    name: 'options',
    type: 'string',
    typeOptions: { multipleValues: true },
    default: [],
    description: 'One value per option. Required when fieldType is "dropdown".',
    displayOptions: { show: { resource: ['customField'], operation: ['create', 'update'], fieldType: ['dropdown'] } },
  },

  // update + delete: field picker (loadOptions)
  {
    displayName: 'Field',
    name: 'fieldId',
    type: 'options',
    default: '',
    required: true,
    description: 'Pick a custom field — populated dynamically from your Sendiee account',
    typeOptions: { loadOptionsMethod: 'getCustomFields' },
    displayOptions: { show: { resource: ['customField'], operation: ['update', 'delete'] } },
  },
];
