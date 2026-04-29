import { INodeProperties } from 'n8n-workflow';

export const tagOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['tag'] } },
    options: [
      { name: 'List', value: 'list', action: 'List tags', description: 'List all contact tags for the org' },
      { name: 'Create', value: 'create', action: 'Create tag', description: 'Create a new contact tag' },
      { name: 'Rename', value: 'rename', action: 'Rename tag', description: 'Rename an existing tag' },
      { name: 'Delete', value: 'delete', action: 'Delete tag', description: 'Delete a contact tag' },
    ],
    default: 'list',
  },
];

export const tagFields: INodeProperties[] = [
  // create
  {
    displayName: 'Tag Name',
    name: 'name',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'VIP',
    displayOptions: { show: { resource: ['tag'], operation: ['create'] } },
  },

  // rename + delete: tag picker (loadOptions)
  {
    displayName: 'Tag',
    name: 'tagId',
    type: 'options',
    default: '',
    required: true,
    description: 'Pick a tag — populated dynamically from your Sendiee account',
    typeOptions: { loadOptionsMethod: 'getTags' },
    displayOptions: { show: { resource: ['tag'], operation: ['rename', 'delete'] } },
  },

  // rename: new name
  {
    displayName: 'New Name',
    name: 'name',
    type: 'string',
    default: '',
    required: true,
    displayOptions: { show: { resource: ['tag'], operation: ['rename'] } },
  },
];
