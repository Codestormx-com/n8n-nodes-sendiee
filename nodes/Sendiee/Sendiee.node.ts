import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  IDataObject,
} from 'n8n-workflow';

import {
  messageOperations,
  messageFields,
} from './descriptions/MessageDescription';

import {
  contactOperations,
  contactFields,
} from './descriptions/ContactDescription';

import {
  scheduledMessageOperations,
  scheduledMessageFields,
} from './descriptions/ScheduledMessageDescription';

import { sendieeApiRequest } from './GenericFunctions';

export class Sendiee implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sendiee',
    name: 'sendiee',
    icon: 'file:sendiee.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Send WhatsApp messages and manage contacts via Sendiee',
    defaults: {
      name: 'Sendiee',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'sendieeApi',
        required: true,
      },
    ],
    requestDefaults: {
      baseURL: 'https://api.sendiee.com/v2.0',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    properties: [
      // ── Resource selector ──────────────────────────────────────────
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Message',
            value: 'message',
            description: 'Send WhatsApp messages (template or freeform)',
          },
          {
            name: 'Contact',
            value: 'contact',
            description: 'Create, update, and search contacts',
          },
          {
            name: 'Scheduled Message',
            value: 'scheduledMessage',
            description: 'View and cancel scheduled messages',
          },
        ],
        default: 'message',
      },

      // ── Operations per resource ────────────────────────────────────
      ...messageOperations,
      ...contactOperations,
      ...scheduledMessageOperations,

      // ── Fields per operation ───────────────────────────────────────
      ...messageFields,
      ...contactFields,
      ...scheduledMessageFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: IDataObject | IDataObject[];

        // ── MESSAGE resource ─────────────────────────────────────────
        if (resource === 'message') {
          // ── sendTemplate ──────────────────────────────────────────
          if (operation === 'sendTemplate') {
            responseData = await handleSendTemplate.call(this, i);
          }

          // ── sendFreeform ──────────────────────────────────────────
          else if (operation === 'sendFreeform') {
            responseData = await handleSendFreeform.call(this, i);
          }

          // ── getStatus ─────────────────────────────────────────────
          else if (operation === 'getStatus') {
            responseData = await handleGetStatus.call(this, i);
          } else {
            throw new NodeOperationError(
              this.getNode(),
              `Unknown message operation: ${operation}`,
            );
          }
        }

        // ── CONTACT resource ─────────────────────────────────────────
        else if (resource === 'contact') {
          if (operation === 'upsert') {
            responseData = await handleContactUpsert.call(this, i);
          } else if (operation === 'getByPhone') {
            responseData = await handleContactGetByPhone.call(this, i);
          } else if (operation === 'filter') {
            responseData = await handleContactFilter.call(this, i);
          } else if (operation === 'list') {
            responseData = await handleContactList.call(this, i);
          } else {
            throw new NodeOperationError(
              this.getNode(),
              `Unknown contact operation: ${operation}`,
            );
          }
        }

        // ── SCHEDULED MESSAGE resource ────────────────────────────────
        else if (resource === 'scheduledMessage') {
          if (operation === 'list') {
            responseData = await handleScheduledList.call(this, i);
          } else if (operation === 'get') {
            responseData = await handleScheduledGet.call(this, i);
          } else if (operation === 'cancel') {
            responseData = await handleScheduledCancel.call(this, i);
          } else {
            throw new NodeOperationError(
              this.getNode(),
              `Unknown scheduledMessage operation: ${operation}`,
            );
          }
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `Unknown resource: ${resource}`,
          );
        }

        // Normalise to array
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(
            Array.isArray(responseData) ? responseData : [responseData],
          ),
          { itemData: { item: i } },
        );
        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          const executionErrorData = this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray({ error: (error as Error).message }),
            { itemData: { item: i } },
          );
          returnData.push(...executionErrorData);
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Operation Handlers
// ─────────────────────────────────────────────────────────────────────────────

async function handleSendTemplate(
  this: IExecuteFunctions,
  i: number,
): Promise<IDataObject> {
  const credentials = await this.getCredentials('sendieeApi');
  const brandNumber = (this.getNodeParameter(
    'brandNumberOverride',
    i,
    credentials.brandNumber,
  ) as string);

  const body: IDataObject = {
    to: this.getNodeParameter('to', i) as string,
    brandNumber: brandNumber || credentials.brandNumber,
  };

  // Template identifier — one of templateName or templateId
  const templateIdentifier = this.getNodeParameter(
    'templateIdentifier',
    i,
  ) as string;
  if (templateIdentifier === 'name') {
    body.templateName = this.getNodeParameter('templateName', i) as string;
  } else {
    body.templateId = this.getNodeParameter('templateId', i) as string;
  }

  const language = this.getNodeParameter('language', i, 'en') as string;
  if (language) body.language = language;

  const defaultCountryCode = this.getNodeParameter(
    'defaultCountryCode',
    i,
    '',
  ) as string;
  if (defaultCountryCode) body.defaultCountryCode = defaultCountryCode;

  // Body parameters (dynamic collection)
  const bodyParamsCollection = this.getNodeParameter(
    'bodyParameters',
    i,
    { values: [] },
  ) as { values: Array<{ value: string }> };
  if (bodyParamsCollection.values?.length) {
    body.bodyParameters = bodyParamsCollection.values.map((p) => p.value);
  }

  // Header parameters
  const headerParamsCollection = this.getNodeParameter(
    'headerParameters',
    i,
    { values: [] },
  ) as { values: Array<{ value: string }> };
  if (headerParamsCollection.values?.length) {
    body.headerParameters = headerParamsCollection.values.map((p) => p.value);
  }

  // Button parameters
  const buttonParamsCollection = this.getNodeParameter(
    'buttonParameters',
    i,
    { values: [] },
  ) as { values: Array<{ value: string }> };
  if (buttonParamsCollection.values?.length) {
    body.buttonParameters = buttonParamsCollection.values.map((p) => p.value);
  }

  // Optional: OTP for AUTHENTICATION templates
  const otp = this.getNodeParameter('otp', i, '') as string;
  if (otp) body.otp = otp;

  // Optional: media URL for header with image/doc/video
  const mediaUrl = this.getNodeParameter('mediaUrl', i, '') as string;
  if (mediaUrl) body.mediaUrl = mediaUrl;

  // Scheduling (hidden by default, shown when toggle is on)
  const scheduleEnabled = this.getNodeParameter(
    'scheduleEnabled',
    i,
    false,
  ) as boolean;
  if (scheduleEnabled) {
    body.scheduledAt = this.getNodeParameter('scheduledAt', i) as string;
    body.timezone = this.getNodeParameter('timezone', i, 'UTC') as string;
  }

  const response = await sendieeApiRequest.call(
    this,
    'POST',
    '/whatsapp/send',
    body,
  );
  return response.data as IDataObject;
}

async function handleSendFreeform(
  this: IExecuteFunctions,
  i: number,
): Promise<IDataObject> {
  const credentials = await this.getCredentials('sendieeApi');
  const brandNumber = (this.getNodeParameter(
    'brandNumberOverride',
    i,
    credentials.brandNumber,
  ) as string);

  const messageType = this.getNodeParameter('messageType', i) as string;

  const contentObject: IDataObject = {};

  if (messageType === 'text') {
    contentObject.body = this.getNodeParameter('textBody', i) as string;
  } else {
    contentObject.link = this.getNodeParameter('mediaLink', i) as string;
    if (messageType === 'document') {
      contentObject.filename = this.getNodeParameter('filename', i) as string;
    }
    const caption = this.getNodeParameter('caption', i, '') as string;
    if (caption && messageType !== 'audio') {
      contentObject.caption = caption;
    }
  }

  const body: IDataObject = {
    to: this.getNodeParameter('to', i) as string,
    brandNumber: brandNumber || credentials.brandNumber,
    type: messageType,
    content: contentObject,
  };

  const scheduleEnabled = this.getNodeParameter(
    'scheduleEnabled',
    i,
    false,
  ) as boolean;
  if (scheduleEnabled) {
    body.scheduledAt = this.getNodeParameter('scheduledAt', i) as string;
    body.timezone = this.getNodeParameter('timezone', i, 'UTC') as string;
  }

  const response = await sendieeApiRequest.call(
    this,
    'POST',
    '/whatsapp/message',
    body,
  );
  return response.data as IDataObject;
}

async function handleGetStatus(
  this: IExecuteFunctions,
  i: number,
): Promise<IDataObject> {
  const credentials = await this.getCredentials('sendieeApi');
  const brandNumber = (this.getNodeParameter(
    'brandNumberOverride',
    i,
    credentials.brandNumber,
  ) as string);

  const qs: IDataObject = {
    messageId: this.getNodeParameter('messageId', i) as string,
    brandNumber: brandNumber || credentials.brandNumber,
  };

  const retry = this.getNodeParameter('retry', i, false) as boolean;
  if (retry) qs.retry = true;

  const response = await sendieeApiRequest.call(
    this,
    'GET',
    '/whatsapp/message/status',
    {},
    qs,
  );
  return response.data as IDataObject;
}

async function handleContactUpsert(
  this: IExecuteFunctions,
  i: number,
): Promise<IDataObject> {
  const body: IDataObject = {
    phone: this.getNodeParameter('phone', i) as string,
  };

  const additionalFields = this.getNodeParameter(
    'additionalFields',
    i,
    {},
  ) as IDataObject;

  // Spread all additional fields directly into body
  Object.assign(body, additionalFields);

  // Handle customFields separately (fixed collection → object)
  const customFieldsCollection = this.getNodeParameter(
    'customFields',
    i,
    { values: [] },
  ) as { values: Array<{ key: string; value: string }> };

  if (customFieldsCollection.values?.length) {
    const customFieldsObject: IDataObject = {};
    for (const field of customFieldsCollection.values) {
      customFieldsObject[field.key] = field.value;
    }
    body.customFields = customFieldsObject;
  }

  const response = await sendieeApiRequest.call(
    this,
    'POST',
    '/contacts',
    body,
  );
  // Merge isNew flag into the data object for easy downstream use
  return {
    ...(response.data as IDataObject),
    isNew: (response.data as IDataObject).isNew,
  };
}

async function handleContactGetByPhone(
  this: IExecuteFunctions,
  i: number,
): Promise<IDataObject> {
  const body: IDataObject = {
    phone: this.getNodeParameter('phone', i) as string,
  };

  const countryCode = this.getNodeParameter('countryCode', i, '') as string;
  if (countryCode) body.countryCode = countryCode;

  const response = await sendieeApiRequest.call(
    this,
    'POST',
    '/contacts/phone',
    body,
  );
  return response.data as IDataObject;
}

async function handleContactFilter(
  this: IExecuteFunctions,
  i: number,
): Promise<IDataObject[]> {
  const filterFieldsCollection = this.getNodeParameter(
    'filterFields',
    i,
    { values: [] },
  ) as { values: Array<{ field: string; value: string }> };

  const filterObject: IDataObject = {};
  for (const f of filterFieldsCollection.values ?? []) {
    filterObject[f.field] = f.value;
  }

  const body: IDataObject = {
    filter: filterObject,
    page: this.getNodeParameter('page', i, 1) as number,
    limit: this.getNodeParameter('limit', i, 50) as number,
  };

  const response = await sendieeApiRequest.call(
    this,
    'POST',
    '/contacts/filter',
    body,
  );
  return response.data as IDataObject[];
}

async function handleContactList(
  this: IExecuteFunctions,
  i: number,
): Promise<IDataObject[]> {
  const qs: IDataObject = {
    page: this.getNodeParameter('page', i, 1) as number,
    limit: this.getNodeParameter('limit', i, 100) as number,
  };

  const response = await sendieeApiRequest.call(
    this,
    'GET',
    '/contacts',
    {},
    qs,
  );
  return response.data as IDataObject[];
}

async function handleScheduledList(
  this: IExecuteFunctions,
  i: number,
): Promise<IDataObject[]> {
  const qs: IDataObject = {
    page: this.getNodeParameter('page', i, 1) as number,
    limit: this.getNodeParameter('limit', i, 50) as number,
  };

  const status = this.getNodeParameter('statusFilter', i, '') as string;
  if (status) qs.status = status;

  const response = await sendieeApiRequest.call(
    this,
    'GET',
    '/scheduled-messages',
    {},
    qs,
  );
  return response.data as IDataObject[];
}

async function handleScheduledGet(
  this: IExecuteFunctions,
  i: number,
): Promise<IDataObject> {
  const scheduleId = this.getNodeParameter('scheduleId', i) as string;
  const response = await sendieeApiRequest.call(
    this,
    'GET',
    `/scheduled-messages/${scheduleId}`,
  );
  return response.data as IDataObject;
}

async function handleScheduledCancel(
  this: IExecuteFunctions,
  i: number,
): Promise<IDataObject> {
  const scheduleId = this.getNodeParameter('scheduleId', i) as string;
  const response = await sendieeApiRequest.call(
    this,
    'DELETE',
    `/scheduled-messages/${scheduleId}`,
  );
  return response.data as IDataObject;
}
