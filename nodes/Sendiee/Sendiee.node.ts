import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  IDataObject,
} from 'n8n-workflow';

import { messageOperations, messageFields } from './descriptions/MessageDescription';
import { contactOperations, contactFields } from './descriptions/ContactDescription';
import { scheduledMessageOperations, scheduledMessageFields } from './descriptions/ScheduledMessageDescription';
import { templateOperations, templateFields } from './descriptions/TemplateDescription';
import { campaignOperations, campaignFields } from './descriptions/CampaignDescription';
import { tagOperations, tagFields } from './descriptions/TagDescription';
import { customFieldOperations, customFieldFields } from './descriptions/CustomFieldDescription';
import { chatOperations, chatFields } from './descriptions/ChatDescription';
import { assistantOperations, assistantFields } from './descriptions/AssistantDescription';

import { sendieeApiRequest } from './GenericFunctions';

// ─── helpers used by both execute() and loadOptions ─────────────────────────

const safeJsonParse = (raw: unknown, fallback: unknown = {}): unknown => {
  if (raw === undefined || raw === null || raw === '') return fallback;
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export class Sendiee implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sendiee',
    name: 'sendiee',
    icon: 'file:sendiee.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Send WhatsApp messages, run campaigns, manage contacts, and configure AI assistants via Sendiee',
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
          { name: 'Message', value: 'message', description: 'Send WhatsApp messages (template or freeform)' },
          { name: 'Contact', value: 'contact', description: 'Create, update, and search contacts' },
          { name: 'Tag', value: 'tag', description: 'Manage contact tags' },
          { name: 'Custom Field', value: 'customField', description: 'Manage custom field definitions' },
          { name: 'Template', value: 'template', description: 'List or create WhatsApp templates' },
          { name: 'Campaign', value: 'campaign', description: 'Preview, create, list and report on template campaigns' },
          { name: 'Chat', value: 'chat', description: 'Inbox: chat history and conversation list' },
          { name: 'Assistant', value: 'assistant', description: 'List and toggle AI assistants' },
          { name: 'Scheduled Message', value: 'scheduledMessage', description: 'View and cancel scheduled messages' },
        ],
        default: 'message',
      },

      // ── Operations per resource ────────────────────────────────────
      ...messageOperations,
      ...contactOperations,
      ...tagOperations,
      ...customFieldOperations,
      ...templateOperations,
      ...campaignOperations,
      ...chatOperations,
      ...assistantOperations,
      ...scheduledMessageOperations,

      // ── Fields per operation ───────────────────────────────────────
      ...messageFields,
      ...contactFields,
      ...tagFields,
      ...customFieldFields,
      ...templateFields,
      ...campaignFields,
      ...chatFields,
      ...assistantFields,
      ...scheduledMessageFields,
    ],
  };

  // ── Dynamic dropdown loaders ─────────────────────────────────────────────
  // Each method calls a list endpoint and returns INodePropertyOptions[].
  // The corresponding field declares typeOptions: { loadOptionsMethod: '<name>' }.
  methods = {
    loadOptions: {
      async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const r = await sendieeApiRequest.call(this, 'GET', '/templates', {}, { status: 'APPROVED' });
        const items = ((r.data as IDataObject[]) || []) as Array<{
          name: string;
          language: string;
          category?: string;
          templateId?: number;
        }>;
        return items.map((t) => ({
          name: `${t.name} (${t.language}) — ${t.category ?? ''}`.trim(),
          value: t.name,
          description: t.templateId ? `Meta ID: ${t.templateId}` : undefined,
        }));
      },

      async getTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const r = await sendieeApiRequest.call(this, 'GET', '/contacts/tags');
        const items = ((r.data as IDataObject[]) || []) as Array<{ _id?: string; id?: string; name: string }>;
        return items.map((t) => ({ name: t.name, value: (t._id ?? t.id) as string }));
      },

      async getCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const r = await sendieeApiRequest.call(this, 'GET', '/contacts/custom_fields');
        const items = ((r.data as IDataObject[]) || []) as Array<{
          _id?: string;
          id?: string;
          fieldName: string;
          fieldKey?: string;
          fieldType?: string;
        }>;
        return items.map((f) => ({
          name: `${f.fieldName}${f.fieldKey ? ` (${f.fieldKey})` : ''}`,
          value: (f._id ?? f.id) as string,
          description: f.fieldType,
        }));
      },

      async getLeadCategories(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const r = await sendieeApiRequest.call(this, 'GET', '/leads/categories');
        const items = ((r.data as IDataObject[]) || []) as Array<{ name: string; description?: string }>;
        return items.map((c) => ({ name: c.name, value: c.name, description: c.description }));
      },

      async getCampaigns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const r = await sendieeApiRequest.call(this, 'GET', '/campaigns', {}, { limit: '100' });
        const items = ((r.data as IDataObject[]) || []) as Array<{
          campaignId?: string;
          _id?: string;
          name?: string;
          campaignName?: string;
          status?: string;
        }>;
        return items.map((c) => ({
          name: `${c.name ?? c.campaignName ?? '(unnamed)'} [${c.status ?? '?'}]`,
          value: (c.campaignId ?? c._id) as string,
        }));
      },

      async getAssistants(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const r = await sendieeApiRequest.call(this, 'GET', '/assistants', {}, { limit: '100' });
        const items = ((r.data as IDataObject[]) || []) as Array<{
          modelId: string;
          name: string;
          platform?: string;
          isActive?: boolean;
        }>;
        return items.map((a) => ({
          name: `${a.name} [${a.platform ?? 'whatsapp'}${a.isActive ? '' : ' · disabled'}]`,
          value: a.modelId,
        }));
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: IDataObject | IDataObject[];

        if (resource === 'message') {
          if (operation === 'sendTemplate') responseData = await handleSendTemplate.call(this, i);
          else if (operation === 'sendFreeform') responseData = await handleSendFreeform.call(this, i);
          else if (operation === 'getStatus') responseData = await handleGetStatus.call(this, i);
          else throw new NodeOperationError(this.getNode(), `Unknown message operation: ${operation}`);
        } else if (resource === 'contact') {
          if (operation === 'upsert') responseData = await handleContactUpsert.call(this, i);
          else if (operation === 'getByPhone') responseData = await handleContactGetByPhone.call(this, i);
          else if (operation === 'filter') responseData = await handleContactFilter.call(this, i);
          else if (operation === 'list') responseData = await handleContactList.call(this, i);
          else throw new NodeOperationError(this.getNode(), `Unknown contact operation: ${operation}`);
        } else if (resource === 'tag') {
          if (operation === 'list') responseData = await handleTagList.call(this, i);
          else if (operation === 'create') responseData = await handleTagCreate.call(this, i);
          else if (operation === 'rename') responseData = await handleTagRename.call(this, i);
          else if (operation === 'delete') responseData = await handleTagDelete.call(this, i);
          else throw new NodeOperationError(this.getNode(), `Unknown tag operation: ${operation}`);
        } else if (resource === 'customField') {
          if (operation === 'list') responseData = await handleCustomFieldList.call(this, i);
          else if (operation === 'create') responseData = await handleCustomFieldCreate.call(this, i);
          else if (operation === 'update') responseData = await handleCustomFieldUpdate.call(this, i);
          else if (operation === 'delete') responseData = await handleCustomFieldDelete.call(this, i);
          else throw new NodeOperationError(this.getNode(), `Unknown customField operation: ${operation}`);
        } else if (resource === 'scheduledMessage') {
          if (operation === 'list') responseData = await handleScheduledList.call(this, i);
          else if (operation === 'get') responseData = await handleScheduledGet.call(this, i);
          else if (operation === 'cancel') responseData = await handleScheduledCancel.call(this, i);
          else throw new NodeOperationError(this.getNode(), `Unknown scheduledMessage operation: ${operation}`);
        } else if (resource === 'template') {
          if (operation === 'list') responseData = await handleTemplateList.call(this, i);
          else if (operation === 'create') responseData = await handleTemplateCreate.call(this, i);
          else throw new NodeOperationError(this.getNode(), `Unknown template operation: ${operation}`);
        } else if (resource === 'campaign') {
          if (operation === 'preview') responseData = await handleCampaignPreview.call(this, i);
          else if (operation === 'create') responseData = await handleCampaignCreate.call(this, i);
          else if (operation === 'list') responseData = await handleCampaignList.call(this, i);
          else if (operation === 'report') responseData = await handleCampaignReport.call(this, i);
          else throw new NodeOperationError(this.getNode(), `Unknown campaign operation: ${operation}`);
        } else if (resource === 'chat') {
          if (operation === 'getHistory') responseData = await handleChatHistory.call(this, i);
          else if (operation === 'listConversations') responseData = await handleListConversations.call(this, i);
          else throw new NodeOperationError(this.getNode(), `Unknown chat operation: ${operation}`);
        } else if (resource === 'assistant') {
          if (operation === 'list') responseData = await handleAssistantList.call(this, i);
          else if (operation === 'toggle') responseData = await handleAssistantToggle.call(this, i);
          else throw new NodeOperationError(this.getNode(), `Unknown assistant operation: ${operation}`);
        } else {
          throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(Array.isArray(responseData) ? responseData : [responseData]),
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

async function handleSendTemplate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const credentials = await this.getCredentials('sendieeApi');
  const brandNumber = this.getNodeParameter('brandNumberOverride', i, credentials.brandNumber) as string;

  const body: IDataObject = {
    to: this.getNodeParameter('to', i) as string,
    brandNumber: brandNumber || credentials.brandNumber,
  };

  const templateIdentifier = this.getNodeParameter('templateIdentifier', i) as string;
  if (templateIdentifier === 'name') {
    body.templateName = this.getNodeParameter('templateName', i) as string;
  } else {
    body.templateId = this.getNodeParameter('templateId', i) as string;
  }

  const language = this.getNodeParameter('language', i, 'en') as string;
  if (language) body.language = language;

  const defaultCountryCode = this.getNodeParameter('defaultCountryCode', i, '') as string;
  if (defaultCountryCode) body.defaultCountryCode = defaultCountryCode;

  const bodyParamsCollection = this.getNodeParameter('bodyParameters', i, { values: [] }) as { values: Array<{ value: string }> };
  if (bodyParamsCollection.values?.length) {
    body.bodyParameters = bodyParamsCollection.values.map((p) => p.value);
  }

  const headerParamsCollection = this.getNodeParameter('headerParameters', i, { values: [] }) as { values: Array<{ value: string }> };
  if (headerParamsCollection.values?.length) {
    body.headerParameters = headerParamsCollection.values.map((p) => p.value);
  }

  const buttonParamsCollection = this.getNodeParameter('buttonParameters', i, { values: [] }) as { values: Array<{ value: string }> };
  if (buttonParamsCollection.values?.length) {
    body.buttonParameters = buttonParamsCollection.values.map((p) => p.value);
  }

  const otp = this.getNodeParameter('otp', i, '') as string;
  if (otp) body.otp = otp;

  const mediaUrl = this.getNodeParameter('mediaUrl', i, '') as string;
  if (mediaUrl) body.mediaUrl = mediaUrl;

  const scheduleEnabled = this.getNodeParameter('scheduleEnabled', i, false) as boolean;
  if (scheduleEnabled) {
    body.scheduledAt = this.getNodeParameter('scheduledAt', i) as string;
    body.timezone = this.getNodeParameter('timezone', i, 'UTC') as string;
  }

  const response = await sendieeApiRequest.call(this, 'POST', '/whatsapp/send', body);
  return response.data as IDataObject;
}

async function handleSendFreeform(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const credentials = await this.getCredentials('sendieeApi');
  const brandNumber = this.getNodeParameter('brandNumberOverride', i, credentials.brandNumber) as string;

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

  const scheduleEnabled = this.getNodeParameter('scheduleEnabled', i, false) as boolean;
  if (scheduleEnabled) {
    body.scheduledAt = this.getNodeParameter('scheduledAt', i) as string;
    body.timezone = this.getNodeParameter('timezone', i, 'UTC') as string;
  }

  const response = await sendieeApiRequest.call(this, 'POST', '/whatsapp/message', body);
  return response.data as IDataObject;
}

async function handleGetStatus(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const credentials = await this.getCredentials('sendieeApi');
  const brandNumber = this.getNodeParameter('brandNumberOverride', i, credentials.brandNumber) as string;

  const qs: IDataObject = {
    messageId: this.getNodeParameter('messageId', i) as string,
    brandNumber: brandNumber || credentials.brandNumber,
  };

  const retry = this.getNodeParameter('retry', i, false) as boolean;
  if (retry) qs.retry = true;

  const response = await sendieeApiRequest.call(this, 'GET', '/whatsapp/message/status', {}, qs);
  return response.data as IDataObject;
}

async function handleContactUpsert(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const body: IDataObject = {
    phone: this.getNodeParameter('phone', i) as string,
  };

  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
  Object.assign(body, additionalFields);

  const customFieldsCollection = this.getNodeParameter('customFields', i, { values: [] }) as { values: Array<{ key: string; value: string }> };
  if (customFieldsCollection.values?.length) {
    const customFieldsObject: IDataObject = {};
    for (const field of customFieldsCollection.values) {
      customFieldsObject[field.key] = field.value;
    }
    body.customFields = customFieldsObject;
  }

  const response = await sendieeApiRequest.call(this, 'POST', '/contacts', body);
  return {
    ...(response.data as IDataObject),
    isNew: (response.data as IDataObject).isNew,
  };
}

async function handleContactGetByPhone(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const body: IDataObject = {
    phone: this.getNodeParameter('phone', i) as string,
  };

  const countryCode = this.getNodeParameter('countryCode', i, '') as string;
  if (countryCode) body.countryCode = countryCode;

  const response = await sendieeApiRequest.call(this, 'POST', '/contacts/phone', body);
  return response.data as IDataObject;
}

async function handleContactFilter(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
  const filterFieldsCollection = this.getNodeParameter('filterFields', i, { values: [] }) as { values: Array<{ field: string; value: string }> };

  const filterObject: IDataObject = {};
  for (const f of filterFieldsCollection.values ?? []) {
    filterObject[f.field] = f.value;
  }

  const body: IDataObject = {
    filter: filterObject,
    page: this.getNodeParameter('page', i, 1) as number,
    limit: this.getNodeParameter('limit', i, 50) as number,
  };

  const response = await sendieeApiRequest.call(this, 'POST', '/contacts/filter', body);
  return response.data as IDataObject[];
}

async function handleContactList(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
  const qs: IDataObject = {
    page: this.getNodeParameter('page', i, 1) as number,
    limit: this.getNodeParameter('limit', i, 100) as number,
  };

  const response = await sendieeApiRequest.call(this, 'GET', '/contacts', {}, qs);
  return response.data as IDataObject[];
}

// ─── Tags ───────────────────────────────────────────────────────────────────

async function handleTagList(this: IExecuteFunctions, _i: number): Promise<IDataObject[]> {
  const response = await sendieeApiRequest.call(this, 'GET', '/contacts/tags');
  return response.data as IDataObject[];
}

async function handleTagCreate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const body: IDataObject = { name: this.getNodeParameter('name', i) as string };
  const response = await sendieeApiRequest.call(this, 'POST', '/contacts/tags', body);
  return response.data as IDataObject;
}

async function handleTagRename(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const tagId = this.getNodeParameter('tagId', i) as string;
  const body: IDataObject = { name: this.getNodeParameter('name', i) as string };
  const response = await sendieeApiRequest.call(this, 'PUT', `/contacts/tags/${tagId}`, body);
  return response.data as IDataObject;
}

async function handleTagDelete(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const tagId = this.getNodeParameter('tagId', i) as string;
  const response = await sendieeApiRequest.call(this, 'DELETE', `/contacts/tags/${tagId}`);
  return response.data as IDataObject;
}

// ─── Custom Fields ──────────────────────────────────────────────────────────

async function handleCustomFieldList(this: IExecuteFunctions, _i: number): Promise<IDataObject[]> {
  const response = await sendieeApiRequest.call(this, 'GET', '/contacts/custom_fields');
  return response.data as IDataObject[];
}

async function handleCustomFieldCreate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const body: IDataObject = {
    fieldName: this.getNodeParameter('fieldName', i) as string,
    fieldType: this.getNodeParameter('fieldType', i) as string,
  };
  const fieldKey = this.getNodeParameter('fieldKey', i, '') as string;
  if (fieldKey) body.fieldKey = fieldKey;
  if (body.fieldType === 'dropdown') {
    body.options = this.getNodeParameter('options', i, []) as string[];
  }
  const response = await sendieeApiRequest.call(this, 'POST', '/contacts/custom_fields', body);
  return response.data as IDataObject;
}

async function handleCustomFieldUpdate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const fieldId = this.getNodeParameter('fieldId', i) as string;
  const body: IDataObject = {
    fieldName: this.getNodeParameter('fieldName', i) as string,
    fieldType: this.getNodeParameter('fieldType', i) as string,
  };
  if (body.fieldType === 'dropdown') {
    body.options = this.getNodeParameter('options', i, []) as string[];
  }
  const response = await sendieeApiRequest.call(this, 'PUT', `/contacts/custom_fields/${fieldId}`, body);
  return response.data as IDataObject;
}

async function handleCustomFieldDelete(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const fieldId = this.getNodeParameter('fieldId', i) as string;
  const response = await sendieeApiRequest.call(this, 'DELETE', `/contacts/custom_fields/${fieldId}`);
  return response.data as IDataObject;
}

// ─── Scheduled Messages ─────────────────────────────────────────────────────

async function handleScheduledList(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
  const qs: IDataObject = {
    page: this.getNodeParameter('page', i, 1) as number,
    limit: this.getNodeParameter('limit', i, 50) as number,
  };
  const status = this.getNodeParameter('statusFilter', i, '') as string;
  if (status) qs.status = status;
  const response = await sendieeApiRequest.call(this, 'GET', '/scheduled-messages', {}, qs);
  return response.data as IDataObject[];
}

async function handleScheduledGet(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const scheduleId = this.getNodeParameter('scheduleId', i) as string;
  const response = await sendieeApiRequest.call(this, 'GET', `/scheduled-messages/${scheduleId}`);
  return response.data as IDataObject;
}

async function handleScheduledCancel(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const scheduleId = this.getNodeParameter('scheduleId', i) as string;
  const response = await sendieeApiRequest.call(this, 'DELETE', `/scheduled-messages/${scheduleId}`);
  return response.data as IDataObject;
}

// ─── Templates ──────────────────────────────────────────────────────────────

async function handleTemplateList(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
  const qs: IDataObject = {};
  const status = this.getNodeParameter('statusFilter', i, '') as string;
  if (status) qs.status = status;
  const category = this.getNodeParameter('categoryFilter', i, '') as string;
  if (category) qs.category = category;
  const response = await sendieeApiRequest.call(this, 'GET', '/templates', {}, qs);
  return response.data as IDataObject[];
}

async function handleTemplateCreate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const body: IDataObject = {
    brandNumber: this.getNodeParameter('brandNumber', i) as string,
    name: this.getNodeParameter('name', i) as string,
    language: this.getNodeParameter('language', i) as string,
    category: this.getNodeParameter('category', i) as string,
  };
  const header = safeJsonParse(this.getNodeParameter('headerJson', i, '{}'), {}) as IDataObject;
  if (header && Object.keys(header).length) body.header = header;
  const bodyObj = safeJsonParse(this.getNodeParameter('bodyJson', i, '{}'), {}) as IDataObject;
  if (bodyObj && Object.keys(bodyObj).length) body.body = bodyObj;
  const footer = safeJsonParse(this.getNodeParameter('footerJson', i, '{}'), {}) as IDataObject;
  if (footer && Object.keys(footer).length) body.footer = footer;
  const buttons = safeJsonParse(this.getNodeParameter('buttonsJson', i, '[]'), []) as IDataObject[];
  if (Array.isArray(buttons) && buttons.length) body.buttons = buttons;
  if (body.category === 'AUTHENTICATION') {
    const auth = safeJsonParse(this.getNodeParameter('authJson', i, '{}'), {}) as IDataObject;
    if (auth && Object.keys(auth).length) body.auth = auth;
  }
  const response = await sendieeApiRequest.call(this, 'POST', '/templates', body);
  return response.data as IDataObject;
}

// ─── Campaigns ──────────────────────────────────────────────────────────────

function buildAudienceFromParams(node: IExecuteFunctions, i: number): IDataObject {
  const mode = node.getNodeParameter('audienceMode', i) as string;
  if (mode === 'raw') {
    const contacts = safeJsonParse(node.getNodeParameter('contactsJson', i, '[]'), []) as IDataObject[];
    return { contacts };
  }
  const audience: IDataObject = {};
  const tags = node.getNodeParameter('tags', i, []) as string[];
  if (tags && tags.length) audience.tags = tags;
  const excludeTags = node.getNodeParameter('excludeTags', i, []) as string[];
  if (excludeTags && excludeTags.length) audience.excludeTags = excludeTags;
  const filters = safeJsonParse(node.getNodeParameter('filtersJson', i, '{}'), {}) as IDataObject;
  if (filters && Object.keys(filters).length) audience.filters = filters;
  return audience;
}

async function handleCampaignPreview(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const credentials = await this.getCredentials('sendieeApi');
  const brandNumber = (this.getNodeParameter('brandNumber', i, '') as string) || (credentials.brandNumber as string);
  const body: IDataObject = {
    brandNumber,
    audience: buildAudienceFromParams(this, i),
  };
  const response = await sendieeApiRequest.call(this, 'POST', '/campaigns/preview', body);
  return response.data as IDataObject;
}

async function handleCampaignCreate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const credentials = await this.getCredentials('sendieeApi');
  const brandNumber = (this.getNodeParameter('brandNumber', i, '') as string) || (credentials.brandNumber as string);
  const body: IDataObject = {
    brandNumber,
    campaignName: this.getNodeParameter('campaignName', i) as string,
    templateName: this.getNodeParameter('templateName', i) as string,
    language: this.getNodeParameter('language', i, 'en_US') as string,
    audience: buildAudienceFromParams(this, i),
  };
  const variables = safeJsonParse(this.getNodeParameter('variablesJson', i, '{}'), {}) as IDataObject;
  if (variables && Object.keys(variables).length) body.variables = variables;
  const scheduleEnabled = this.getNodeParameter('scheduleEnabled', i, false) as boolean;
  if (scheduleEnabled) {
    body.schedule = {
      sendAt: this.getNodeParameter('scheduleSendAt', i) as string,
      timezone: this.getNodeParameter('scheduleTimezone', i, 'UTC') as string,
    };
  }
  const response = await sendieeApiRequest.call(this, 'POST', '/campaigns', body);
  return response.data as IDataObject;
}

async function handleCampaignList(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
  const qs: IDataObject = {
    page: this.getNodeParameter('page', i, 1) as number,
    limit: this.getNodeParameter('limit', i, 20) as number,
  };
  const status = this.getNodeParameter('statusFilter', i, '') as string;
  if (status) qs.status = status;
  const response = await sendieeApiRequest.call(this, 'GET', '/campaigns', {}, qs);
  return response.data as IDataObject[];
}

async function handleCampaignReport(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const campaignId = this.getNodeParameter('campaignId', i) as string;
  const response = await sendieeApiRequest.call(this, 'GET', `/campaigns/${campaignId}/report`);
  return response.data as IDataObject;
}

// ─── Chats ──────────────────────────────────────────────────────────────────

async function handleChatHistory(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const qs: IDataObject = {};
  const phone = this.getNodeParameter('phone', i, '') as string;
  const contactId = this.getNodeParameter('contactId', i, '') as string;
  if (phone) qs.phone = phone;
  if (contactId) qs.contactId = contactId;
  const limit = this.getNodeParameter('limit', i, 20) as number;
  if (limit) qs.limit = limit;
  const before = this.getNodeParameter('before', i, '') as string;
  if (before) qs.before = before;
  const response = await sendieeApiRequest.call(this, 'GET', '/chats/history', {}, qs);
  return {
    contact: response.contact,
    pagination: response.pagination,
    messages: response.data,
  };
}

async function handleListConversations(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
  const qs: IDataObject = {
    page: this.getNodeParameter('page', i, 1) as number,
    limit: this.getNodeParameter('limit', i, 20) as number,
  };
  const brandNumber = this.getNodeParameter('brandNumber', i, '') as string;
  if (brandNumber) qs.brandNumber = brandNumber;
  const archived = this.getNodeParameter('archived', i, '') as string;
  if (archived) qs.archived = archived;
  const search = this.getNodeParameter('search', i, '') as string;
  if (search) qs.search = search;
  const response = await sendieeApiRequest.call(this, 'GET', '/chats/conversations', {}, qs);
  return response.data as IDataObject[];
}

// ─── Assistants ─────────────────────────────────────────────────────────────

async function handleAssistantList(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
  const qs: IDataObject = {};
  const platform = this.getNodeParameter('platformFilter', i, '') as string;
  if (platform) qs.platform = platform;
  const isActive = this.getNodeParameter('isActiveFilter', i, '') as string;
  if (isActive) qs.isActive = isActive;
  const isConnected = this.getNodeParameter('isConnectedFilter', i, '') as string;
  if (isConnected) qs.isConnected = isConnected;
  const name = this.getNodeParameter('nameFilter', i, '') as string;
  if (name) qs.name = name;
  const response = await sendieeApiRequest.call(this, 'GET', '/assistants', {}, qs);
  return response.data as IDataObject[];
}

async function handleAssistantToggle(this: IExecuteFunctions, i: number): Promise<IDataObject> {
  const modelId = this.getNodeParameter('modelId', i) as string;
  const isActive = this.getNodeParameter('isActive', i) as boolean;
  const response = await sendieeApiRequest.call(this, 'POST', `/assistants/${modelId}/toggle`, { isActive });
  return response.data as IDataObject;
}
