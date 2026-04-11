import { INodeProperties } from 'n8n-workflow';

export const messageOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: { resource: ['message'] },
    },
    options: [
      {
        name: 'Send Template Message',
        value: 'sendTemplate',
        description: 'Send an approved WhatsApp template message',
        action: 'Send a template message',
      },
      {
        name: 'Send Freeform Message',
        value: 'sendFreeform',
        description:
          'Send text, image, document, audio, or video within the 24-hour customer service window',
        action: 'Send a freeform message',
      },
      {
        name: 'Get Message Status',
        value: 'getStatus',
        description: 'Check the delivery status of a sent message',
        action: 'Get message status',
      },
    ],
    default: 'sendTemplate',
  },
];

export const messageFields: INodeProperties[] = [
  // ─── SHARED: Recipient phone ────────────────────────────────────────────────
  {
    displayName: 'Recipient Phone Number',
    name: 'to',
    type: 'string',
    required: true,
    default: '',
    placeholder: '919876543210',
    description:
      'Recipient phone number in full international format without +. Example: 919876543210 for +91 98765 43210. The API auto-sanitises +, spaces, dashes, and parentheses.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendTemplate', 'sendFreeform'],
      },
    },
  },

  // ─── SHARED: Brand number override ─────────────────────────────────────────
  {
    displayName: 'Brand Number Override',
    name: 'brandNumberOverride',
    type: 'string',
    default: '',
    placeholder: 'Leave blank to use credential default',
    description:
      'Override the WhatsApp Business phone number (brandNumber) from the credential. Leave blank to use the credential default.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendTemplate', 'sendFreeform', 'getStatus'],
      },
    },
  },

  // ─── sendTemplate: Template identifier ─────────────────────────────────────
  {
    displayName: 'Identify Template By',
    name: 'templateIdentifier',
    type: 'options',
    default: 'name',
    options: [
      { name: 'Template Name', value: 'name' },
      { name: 'Template ID (Meta ID)', value: 'id' },
    ],
    displayOptions: {
      show: { resource: ['message'], operation: ['sendTemplate'] },
    },
  },
  {
    displayName: 'Template Name',
    name: 'templateName',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'order_confirmation',
    description:
      'The template name as configured in your Sendiee Template Manager. Must be in APPROVED status.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendTemplate'],
        templateIdentifier: ['name'],
      },
    },
  },
  {
    displayName: 'Template ID',
    name: 'templateId',
    type: 'string',
    default: '',
    required: true,
    placeholder: '1234567890',
    description:
      'The Meta template ID. Use this instead of template name if you have the ID.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendTemplate'],
        templateIdentifier: ['id'],
      },
    },
  },

  // ─── sendTemplate: Language ─────────────────────────────────────────────────
  {
    displayName: 'Language',
    name: 'language',
    type: 'string',
    default: 'en',
    placeholder: 'en',
    description:
      'Template language code. Default is "en". Use codes like "en_US", "hi", "ar", etc.',
    displayOptions: {
      show: { resource: ['message'], operation: ['sendTemplate'] },
    },
  },

  // ─── sendTemplate: Default country code ────────────────────────────────────
  {
    displayName: 'Default Country Code',
    name: 'defaultCountryCode',
    type: 'string',
    default: '',
    placeholder: '91',
    description:
      'Optional. If the recipient phone number is a local number (without country code), provide the country code here and it will be prepended automatically. Example: "91" for India.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendTemplate', 'sendFreeform'],
      },
    },
  },

  // ─── sendTemplate: Body parameters ─────────────────────────────────────────
  {
    displayName: 'Body Parameters',
    name: 'bodyParameters',
    type: 'fixedCollection',
    default: { values: [] },
    typeOptions: { multipleValues: true },
    description:
      'Values for {{1}}, {{2}}, etc. placeholders in the template body. Add them in order.',
    placeholder: 'Add Parameter',
    displayOptions: {
      show: { resource: ['message'], operation: ['sendTemplate'] },
    },
    options: [
      {
        name: 'values',
        displayName: 'Parameter',
        values: [
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
            description: 'Value for this template placeholder (in order)',
          },
        ],
      },
    ],
  },

  // ─── sendTemplate: Header parameters ───────────────────────────────────────
  {
    displayName: 'Header Parameters',
    name: 'headerParameters',
    type: 'fixedCollection',
    default: { values: [] },
    typeOptions: { multipleValues: true },
    description:
      'Values for {{1}} placeholders in the template header (text headers only).',
    placeholder: 'Add Header Parameter',
    displayOptions: {
      show: { resource: ['message'], operation: ['sendTemplate'] },
    },
    options: [
      {
        name: 'values',
        displayName: 'Parameter',
        values: [
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

  // ─── sendTemplate: Button parameters ───────────────────────────────────────
  {
    displayName: 'Button Parameters',
    name: 'buttonParameters',
    type: 'fixedCollection',
    default: { values: [] },
    typeOptions: { multipleValues: true },
    description: 'Values for dynamic URL buttons in the template.',
    placeholder: 'Add Button Parameter',
    displayOptions: {
      show: { resource: ['message'], operation: ['sendTemplate'] },
    },
    options: [
      {
        name: 'values',
        displayName: 'Parameter',
        values: [
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

  // ─── sendTemplate: Media URL (for image/document/video header) ─────────────
  {
    displayName: 'Media URL (Header)',
    name: 'mediaUrl',
    type: 'string',
    default: '',
    placeholder: 'https://example.com/image.jpg',
    description:
      'Required when the template has an IMAGE, DOCUMENT, or VIDEO header. Provide the public URL of the media file.',
    displayOptions: {
      show: { resource: ['message'], operation: ['sendTemplate'] },
    },
  },

  // ─── sendTemplate: OTP for AUTHENTICATION templates ────────────────────────
  {
    displayName: 'OTP Code',
    name: 'otp',
    type: 'string',
    default: '',
    placeholder: '123456',
    description:
      'Required for AUTHENTICATION category templates. Provide the one-time password to send.',
    displayOptions: {
      show: { resource: ['message'], operation: ['sendTemplate'] },
    },
  },

  // ─── sendFreeform: Message type ─────────────────────────────────────────────
  {
    displayName: 'Message Type',
    name: 'messageType',
    type: 'options',
    default: 'text',
    required: true,
    description:
      'Type of message to send. Only usable within the 24-hour customer service window.',
    options: [
      { name: 'Text', value: 'text' },
      { name: 'Image', value: 'image' },
      { name: 'Document', value: 'document' },
      { name: 'Audio', value: 'audio' },
      { name: 'Video', value: 'video' },
    ],
    displayOptions: {
      show: { resource: ['message'], operation: ['sendFreeform'] },
    },
  },

  // ─── sendFreeform: Text body ────────────────────────────────────────────────
  {
    displayName: 'Message Text',
    name: 'textBody',
    type: 'string',
    typeOptions: { rows: 4 },
    default: '',
    required: true,
    description: 'The text content of the message.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendFreeform'],
        messageType: ['text'],
      },
    },
  },

  // ─── sendFreeform: Media link ───────────────────────────────────────────────
  {
    displayName: 'Media URL',
    name: 'mediaLink',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'https://example.com/file.pdf',
    description: 'Public URL of the media file to send.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendFreeform'],
        messageType: ['image', 'document', 'audio', 'video'],
      },
    },
  },

  // ─── sendFreeform: Filename (document only) ─────────────────────────────────
  {
    displayName: 'Filename',
    name: 'filename',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'Invoice-1234.pdf',
    description: 'Filename displayed to the recipient in WhatsApp.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendFreeform'],
        messageType: ['document'],
      },
    },
  },

  // ─── sendFreeform: Caption (image, document, video) ─────────────────────────
  {
    displayName: 'Caption',
    name: 'caption',
    type: 'string',
    default: '',
    description: 'Optional caption displayed below the media.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendFreeform'],
        messageType: ['image', 'document', 'video'],
      },
    },
  },

  // ─── getStatus: Message ID ──────────────────────────────────────────────────
  {
    displayName: 'Message ID',
    name: 'messageId',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'wamid.HBgM...',
    description: 'The message ID (wamid) returned from the send endpoint.',
    displayOptions: {
      show: { resource: ['message'], operation: ['getStatus'] },
    },
  },

  // ─── getStatus: Retry flag ──────────────────────────────────────────────────
  {
    displayName: 'Retry If Not Found',
    name: 'retry',
    type: 'boolean',
    default: false,
    description:
      'Whether to wait 5 seconds and retry once if the message is not found immediately after sending.',
    displayOptions: {
      show: { resource: ['message'], operation: ['getStatus'] },
    },
  },

  // ─── SHARED: Schedule toggle (sendTemplate + sendFreeform) ─────────────────
  {
    displayName: 'Schedule for Later',
    name: 'scheduleEnabled',
    type: 'boolean',
    default: false,
    description:
      'Whether to schedule this message for future delivery instead of sending immediately.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendTemplate', 'sendFreeform'],
      },
    },
  },
  {
    displayName: 'Scheduled At',
    name: 'scheduledAt',
    type: 'dateTime',
    default: '',
    required: true,
    description:
      'Future date and time to send the message. Must be a future time. Returns a scheduleId instead of a messageId.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendTemplate', 'sendFreeform'],
        scheduleEnabled: [true],
      },
    },
  },
  {
    displayName: 'Timezone',
    name: 'timezone',
    type: 'string',
    default: 'UTC',
    placeholder: 'Asia/Kolkata',
    description:
      'IANA timezone string for the scheduled time. Default is UTC. Examples: Asia/Kolkata, America/New_York, Europe/London.',
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendTemplate', 'sendFreeform'],
        scheduleEnabled: [true],
      },
    },
  },
];
