import { INodeProperties } from 'n8n-workflow';

export const contactOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: { resource: ['contact'] },
    },
    options: [
      {
        name: 'Create or Update (Upsert)',
        value: 'upsert',
        description:
          'Create a new contact or update if phone already exists. Returns isNew: true/false.',
        action: 'Create or update a contact',
      },
      {
        name: 'Get by Phone',
        value: 'getByPhone',
        description: 'Look up a single contact by their phone number.',
        action: 'Get a contact by phone',
      },
      {
        name: 'Filter Contacts',
        value: 'filter',
        description: 'Search contacts by any field combination.',
        action: 'Filter contacts',
      },
      {
        name: 'List All',
        value: 'list',
        description: 'List all contacts (paginated).',
        action: 'List all contacts',
      },
    ],
    default: 'upsert',
  },
];

export const contactFields: INodeProperties[] = [
  // ─── Shared phone ────────────────────────────────────────────────────────────
  {
    displayName: 'Phone Number',
    name: 'phone',
    type: 'string',
    required: true,
    default: '',
    placeholder: '919876543210',
    description:
      'Phone number in full international format without +. Auto-sanitised by API.',
    displayOptions: {
      show: {
        resource: ['contact'],
        operation: ['upsert', 'getByPhone'],
      },
    },
  },

  // ─── getByPhone: Country code ─────────────────────────────────────────────
  {
    displayName: 'Country Code',
    name: 'countryCode',
    type: 'string',
    default: '',
    placeholder: '91',
    description:
      'Optional. Prepend this country code to the phone number for local numbers.',
    displayOptions: {
      show: { resource: ['contact'], operation: ['getByPhone'] },
    },
  },

  // ─── upsert: Additional fields collection ─────────────────────────────────
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: { resource: ['contact'], operation: ['upsert'] },
    },
    options: [
      {
        displayName: 'Full Name',
        name: 'contactName',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        placeholder: 'name@example.com',
        default: '',
      },
      {
        displayName: 'Business Name',
        name: 'businessName',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Platform',
        name: 'platform',
        type: 'options',
        default: 'whatsapp',
        options: [{ name: 'WhatsApp', value: 'whatsapp' }],
      },
      {
        displayName: 'Lead Category',
        name: 'lead_category',
        type: 'string',
        default: '',
        description:
          'Must exactly match a category configured in your Sendiee dashboard (e.g. "Interested", "Cold", "Hot").',
      },
      {
        displayName: 'Source',
        name: 'source',
        type: 'string',
        default: 'api',
        description: 'Lead source label. Default is "api".',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        typeOptions: { rows: 3 },
        default: '',
      },
      {
        displayName: 'Country Code',
        name: 'countryCode',
        type: 'string',
        default: '',
        placeholder: '91',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
      },
      {
        displayName: 'State',
        name: 'state',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Postal Code',
        name: 'postalCode',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Country',
        name: 'country',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Address Line 1',
        name: 'addressLine1',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Address Line 2',
        name: 'addressLine2',
        type: 'string',
        default: '',
      },
    ],
  },

  // ─── upsert: Custom fields ────────────────────────────────────────────────
  {
    displayName: 'Custom Fields',
    name: 'customFields',
    type: 'fixedCollection',
    default: { values: [] },
    typeOptions: { multipleValues: true },
    description:
      'Add any custom key-value pairs to store on this contact (e.g. shopify_customer_id, order_count).',
    placeholder: 'Add Custom Field',
    displayOptions: {
      show: { resource: ['contact'], operation: ['upsert'] },
    },
    options: [
      {
        name: 'values',
        displayName: 'Field',
        values: [
          {
            displayName: 'Key',
            name: 'key',
            type: 'string',
            default: '',
            placeholder: 'shopify_customer_id',
          },
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
          },
        ],
      },
    ],
  },

  // ─── filter: Filter fields ────────────────────────────────────────────────
  {
    displayName: 'Filter Fields',
    name: 'filterFields',
    type: 'fixedCollection',
    default: { values: [] },
    typeOptions: { multipleValues: true },
    description:
      'Add filters. String fields use partial match. Exact match for: countryCode, platform, source, lead_category, optedOut, postalCode.',
    placeholder: 'Add Filter',
    displayOptions: {
      show: { resource: ['contact'], operation: ['filter'] },
    },
    options: [
      {
        name: 'values',
        displayName: 'Filter',
        values: [
          {
            displayName: 'Field',
            name: 'field',
            type: 'options',
            default: 'contactName',
            options: [
              { name: 'Phone', value: 'phone' },
              { name: 'Contact Name', value: 'contactName' },
              { name: 'Email', value: 'email' },
              { name: 'Country Code', value: 'countryCode' },
              { name: 'Platform', value: 'platform' },
              { name: 'Business Name', value: 'businessName' },
              { name: 'City', value: 'city' },
              { name: 'State', value: 'state' },
              { name: 'Postal Code', value: 'postalCode' },
              { name: 'Country', value: 'country' },
              { name: 'Source', value: 'source' },
              { name: 'Lead Category', value: 'lead_category' },
              { name: 'Opted Out', value: 'optedOut' },
            ],
          },
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
          },
        ],
      },
    ],
  },

  // ─── Shared pagination ────────────────────────────────────────────────────
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 1 },
    description: 'Page number for paginated results.',
    displayOptions: {
      show: { resource: ['contact'], operation: ['filter', 'list'] },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1, maxValue: 500 },
    description:
      'Maximum number of results to return. Max 500 for filter, max 100 for list.',
    displayOptions: {
      show: { resource: ['contact'], operation: ['filter', 'list'] },
    },
  },
];
