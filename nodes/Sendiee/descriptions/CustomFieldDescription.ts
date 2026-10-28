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
      { name: 'Multi-select', value: 'multiselect' },
      { name: 'URL', value: 'url' },
      { name: 'Phone', value: 'phone' },
      { name: 'File', value: 'file' },
    ],
    description: 'Dropdown and Multi-select need options. A Multi-select value on a contact is a list of strings. A File field holds files uploaded on the lead in Sendiee; through the API its value is read-only file details (name, type, size, upload time, uploader), never a link.',
    displayOptions: { show: { resource: ['customField'], operation: ['create'] } },
  },
  {
    displayName: 'Allow Multiple Files',
    name: 'allowMultiple',
    type: 'boolean',
    default: false,
    description: 'Whether the field holds up to 10 files. When off, it holds 1 file and a new upload replaces it.',
    displayOptions: { show: { resource: ['customField'], operation: ['create'], fieldType: ['file'] } },
  },
  // update: same name, but defaults to "keep current" so an update never
  // changes the field's type unless one is picked explicitly.
  {
    displayName: 'Field Type',
    name: 'fieldType',
    type: 'options',
    default: '',
    options: [
      { name: 'Keep Current Type', value: '' },
      { name: 'Text', value: 'text' },
      { name: 'Number', value: 'number' },
      { name: 'Date', value: 'date' },
      { name: 'Boolean', value: 'boolean' },
      { name: 'Dropdown', value: 'dropdown' },
      { name: 'Multi-select', value: 'multiselect' },
      { name: 'URL', value: 'url' },
      { name: 'Phone', value: 'phone' },
      { name: 'File', value: 'file' },
    ],
    description: 'Leave as "Keep Current Type" to leave the type unchanged. Dropdown and Multi-select need options. A field can\'t switch to or from File.',
    displayOptions: { show: { resource: ['customField'], operation: ['update'] } },
  },
  {
    displayName: 'Files Per Lead',
    name: 'allowMultipleUpdate',
    type: 'options',
    default: '',
    options: [
      { name: 'Keep Current Setting', value: '' },
      { name: 'One File', value: 'single' },
      { name: 'Up to 10 Files', value: 'multiple' },
    ],
    description: 'File fields only. "One File" can\'t be set while a lead holds more than one file in the field.',
    displayOptions: { show: { resource: ['customField'], operation: ['update'], fieldType: ['', 'file'] } },
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'string',
    typeOptions: { multipleValues: true },
    default: [],
    description: 'One value per option. Required when fieldType is "dropdown" or "multiselect".',
    displayOptions: { show: { resource: ['customField'], operation: ['create', 'update'], fieldType: ['dropdown', 'multiselect'] } },
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
