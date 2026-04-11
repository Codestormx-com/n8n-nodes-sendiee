# SENDIEE n8n Community Node — Complete Implementation Guide

> **Purpose:** This document is a self-contained implementation specification for building the `n8n-nodes-sendiee` community node package.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Package Setup](#3-package-setup)
4. [Sendiee API Reference Summary](#4-sendiee-api-reference-summary)
5. [Credential Node Implementation](#5-credential-node-implementation)
6. [Main Node Implementation](#6-main-node-implementation)
7. [Node Properties — Full UI Specification](#7-node-properties--full-ui-specification)
8. [Operations Implementation](#8-operations-implementation)
9. [Error Handling](#9-error-handling)
10. [Helper Utilities](#10-helper-utilities)
11. [Node Icons & Assets](#11-node-icons--assets)
12. [Testing](#12-testing)
13. [Publishing to npm](#13-publishing-to-npm)
14. [README Template](#14-readme-template)
15. [Critical Rules & Gotchas](#15-critical-rules--gotchas)

---

## 1. Project Overview

### What We Are Building

A TypeScript n8n community node package that wraps the **Sendiee REST API** (WhatsApp Business messaging platform). Users install this from the n8n community nodes registry instead of manually configuring HTTP Request nodes.

### Package Identity

| Field | Value |
|-------|-------|
| npm package name | `n8n-nodes-sendiee` |
| Node display name | `Sendiee` |
| Node internal name | `sendiee` |
| Credential name | `sendieeApi` |
| Author | Surya Prakash Vadivel/Codestormx |
| License | MIT |
| n8n min version | `>=1.0.0` |

### Nodes to Create

| File | Type | Purpose |
|------|------|---------|
| `nodes/Sendiee/Sendiee.node.ts` | Regular Node | Main action node (Messages, Contacts, Scheduled) |
| `credentials/SendieeApi.credentials.ts` | Credential | API key storage |

### What This Node Does NOT Include (out of scope)

- Trigger/webhook node (Sendiee webhook docs are not yet published)
- Bulk/broadcast campaigns (not in REST API)
- Template management (not in REST API)

---

## 2. Repository Structure

```
n8n-nodes-sendiee/
├── credentials/
│   └── SendieeApi.credentials.ts
├── nodes/
│   └── Sendiee/
│       ├── Sendiee.node.ts
│       ├── sendiee.svg                  ← node icon (WhatsApp green or Sendiee brand)
│       └── descriptions/               ← optional: split large property arrays here
│           ├── MessageDescription.ts
│           ├── ContactDescription.ts
│           └── ScheduledMessageDescription.ts
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
├── README.md
└── index.js                            ← re-export entry point (generated, see below)
```

---

## 3. Package Setup

### 3.1 `package.json`

```json
{
  "name": "n8n-nodes-sendiee",
  "version": "0.1.0",
  "description": "n8n community node for Sendiee — WhatsApp Business messaging via the Sendiee API",
  "keywords": [
    "n8n-community-node-package",
    "n8n",
    "sendiee",
    "whatsapp",
    "whatsapp-business",
    "messaging"
  ],
  "license": "MIT",
  "homepage": "https://github.com/Codestormx-com/n8n-nodes-sendiee",
  "author": {
    "name": "Surya Prakash Vadivel",
    "email": "surya@codestormx.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/Codestormx-com/n8n-nodes-sendiee.git"
  },
  "main": "index.js",
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "format": "prettier nodes credentials --write",
    "lint": "eslint nodes credentials --ext .ts",
    "lintfix": "eslint nodes credentials --ext .ts --fix",
    "prepublishOnly": "npm run build && npm run lint"
  },
  "files": [
    "dist"
  ],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/SendieeApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/Sendiee/Sendiee.node.js"
    ]
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "eslint": "^8.0.0",
    "n8n-workflow": "*",
    "typescript": "^5.0.0",
    "prettier": "^3.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "eslint-plugin-n8n-nodes-base": "^1.0.0",
    "gulp": "^4.0.0"
  },
  "peerDependencies": {
    "n8n-workflow": "*"
  }
}
```

> **IMPORTANT:** The `"n8n-community-node-package"` keyword is **required** — n8n uses it to identify community nodes in its registry. Without it, the node will not appear in the n8n community nodes installer.

### 3.2 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "lib": ["ES2019"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["credentials/**/*", "nodes/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3.3 `.eslintrc.js`

```js
module.exports = {
  root: true,
  env: { node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { project: ['./tsconfig.json'] },
  plugins: ['@typescript-eslint', 'n8n-nodes-base'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:n8n-nodes-base/community',
  ],
  rules: {
    'n8n-nodes-base/node-dirname-against-convention': 'error',
    'n8n-nodes-base/node-filename-against-convention': 'error',
    'n8n-nodes-base/cred-class-field-authenticate-missing': 'error',
    'n8n-nodes-base/cred-class-field-display-name-missing-api': 'error',
  },
};
```

### 3.4 `gulpfile.js`

```js
const { src, dest } = require('gulp');

function buildIcons() {
  return src('nodes/**/*.svg').pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
```

---

## 4. Sendiee API Reference Summary

> Full source of truth: the Sendiee API docs passed in context. This section summarises everything the node code needs.

### 4.1 Base URL and Auth

```
Base URL:  https://api.sendiee.com
Version:   /v2.0/
Auth:      Authorization: Bearer {API_KEY}
Content:   application/json
```

### 4.2 Key Concept: `brandNumber`

- Every WhatsApp messaging request requires `brandNumber` — the WhatsApp Business phone number registered in Sendiee
- Format: full international number **without** `+` (e.g. `917012345678`)
- **One brandNumber per Sendiee org = one brandNumber per API key**
- Therefore: store `brandNumber` in the credential, not as a per-request field
- Allow override on the node itself for edge cases

### 4.3 Phone Number Format

- All recipient phone numbers (`to`) use full international format without `+`
- e.g. `919876543210` for +91 98765 43210
- API auto-sanitises `+`, spaces, dashes, parentheses
- Use `defaultCountryCode` to auto-prepend country code to local numbers

### 4.4 All Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v2.0/whatsapp/send` | Send template message (or schedule one) |
| POST | `/v2.0/whatsapp/message` | Send freeform message (text/image/document/audio/video) |
| GET | `/v2.0/whatsapp/message/status` | Get delivery status of a message |
| GET | `/v2.0/contacts` | List all contacts (paginated) |
| POST | `/v2.0/contacts/filter` | Filter contacts by field values |
| POST | `/v2.0/contacts/phone` | Get a single contact by phone number |
| POST | `/v2.0/contacts` | Create or update a contact (upsert) |
| GET | `/v2.0/scheduled-messages` | List scheduled messages |
| GET | `/v2.0/scheduled-messages/:scheduleId` | Get a specific scheduled message |
| DELETE | `/v2.0/scheduled-messages/:scheduleId` | Cancel a scheduled message |

### 4.5 Standard Response Envelope

**Success:**
```json
{ "success": true, "message": "...", "data": { ... } }
```

**Error:**
```json
{ "success": false, "code": "ERROR_CODE", "message": "Human-readable description" }
```

### 4.6 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `API_KEY_MISSING` | 401 | No API key in Authorization header |
| `INVALID_API_KEY` | 401 | API key does not exist or is revoked |
| `ORG_INACTIVE` | 403 | Organisation account is inactive |
| `DOMAIN_NOT_WHITELISTED` | 403 | Request origin domain not in allowed list |
| `BRAND_NUMBER_MISSING` | 400 | `brandNumber` not provided |
| `WABA_NOT_FOUND` | 404 | No active WhatsApp account for given `brandNumber` |
| `MISSING_RECIPIENT` | 400 | `to` field is required |
| `INVALID_PHONE_NUMBER` | 400 | Phone number failed validation |
| `MISSING_TEMPLATE` | 400 | Neither `templateId` nor `templateName` provided |
| `TEMPLATE_NOT_FOUND` | 404 | Template not found or not APPROVED |
| `PARAMETER_VALIDATION_ERROR` | 400 | Template parameters count mismatch |
| `INVALID_SCHEDULE_TIME` | 400 | Scheduled time is in the past |
| `META_API_ERROR` | 502 | Error returned by Meta's WhatsApp Cloud API |
| `MESSAGE_SEND_FAILED` | 500 | Internal error sending message |
| `MISSING_CONTENT` | 400 | Message content is empty or missing |
| `MISSING_TEXT_BODY` | 400 | Text message missing `body` field |
| `MISSING_MEDIA_LINK` | 400 | Media message missing `link` field |
| `MESSAGE_NOT_FOUND` | 404 | Message ID not found in this org |
| `SCHEDULE_NOT_CANCELLABLE` | 400 | Message already sent/processing |

---

## 5. Credential Node Implementation

### File: `credentials/SendieeApi.credentials.ts`

```typescript
import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class SendieeApi implements ICredentialType {
  name = 'sendieeApi';
  displayName = 'Sendiee API';
  documentationUrl = 'https://docs.sendiee.com'; // update if URL changes
  icon = 'file:sendiee.svg' as const;

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description:
        'Your Sendiee API key. Get it from Dashboard → Settings → API Keys.',
    },
    {
      displayName: 'Brand Number (WhatsApp Business Phone)',
      name: 'brandNumber',
      type: 'string',
      default: '',
      required: true,
      placeholder: '917012345678',
      description:
        'Your WhatsApp Business phone number in full international format WITHOUT the leading +. Example: 917012345678 for +91 70123 45678. Found in your Sendiee Dashboard.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.sendiee.com',
      url: '/v2.0/contacts',
      method: 'GET',
      qs: { page: 1, limit: 1 },
    },
    // n8n checks for a 2xx response. Sendiee returns 200 with { success: true } on valid key.
  };
}
```

---

## 6. Main Node Implementation

### File: `nodes/Sendiee/Sendiee.node.ts`

```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeApiError,
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
    group: ['communication'],
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
          }

          else {
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
        }

        else {
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
  const brandNumber = this.getNodeParameter('brandNumberOverride', i, credentials.brandNumber) as string;

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
  const brandNumber = this.getNodeParameter('brandNumberOverride', i, credentials.brandNumber) as string;

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
```

---

## 7. Node Properties — Full UI Specification

### File: `nodes/Sendiee/descriptions/MessageDescription.ts`

```typescript
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
    description:
      'The message ID (wamid) returned from the send endpoint.',
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
    description: 'Whether to schedule this message for future delivery instead of sending immediately.',
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
```

### File: `nodes/Sendiee/descriptions/ContactDescription.ts`

```typescript
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
```

### File: `nodes/Sendiee/descriptions/ScheduledMessageDescription.ts`

```typescript
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
```

---

## 8. Operations Implementation

### File: `nodes/Sendiee/GenericFunctions.ts`

```typescript
import {
  IExecuteFunctions,
  IHttpRequestMethods,
  IDataObject,
  NodeApiError,
} from 'n8n-workflow';

/**
 * Central HTTP helper for all Sendiee API calls.
 * Handles auth injection, error mapping, and response unwrapping.
 */
export async function sendieeApiRequest(
  this: IExecuteFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
): Promise<IDataObject> {
  const credentials = await this.getCredentials('sendieeApi');

  const options = {
    method,
    baseURL: 'https://api.sendiee.com/v2.0',
    url: endpoint,
    headers: {
      Authorization: `Bearer ${credentials.apiKey}`,
      'Content-Type': 'application/json',
    },
    qs,
    body,
    json: true,
    // Do not throw on non-2xx — we handle errors ourselves
    // so we can surface Sendiee's error codes
  };

  // Remove empty body for GET/DELETE
  if (['GET', 'DELETE'].includes(method)) {
    delete (options as Record<string, unknown>).body;
  }

  let response: IDataObject;

  try {
    response = await this.helpers.httpRequest(options);
  } catch (error) {
    // Re-throw n8n NodeApiError for network-level failures
    throw new NodeApiError(this.getNode(), error as Error);
  }

  // Sendiee always returns { success: boolean, ... }
  if (response.success === false) {
    const code = response.code as string || 'UNKNOWN_ERROR';
    const message = response.message as string || 'Unknown error from Sendiee API';

    // Map Sendiee error codes to friendly n8n messages
    const friendlyMessages: Record<string, string> = {
      API_KEY_MISSING: 'API key is missing. Check your Sendiee credentials.',
      INVALID_API_KEY: 'Invalid API key. Regenerate it in Sendiee Dashboard → Settings → API Keys.',
      ORG_INACTIVE: 'Your Sendiee organisation is inactive. Contact Sendiee support.',
      BRAND_NUMBER_MISSING: 'Brand number (WhatsApp Business phone) is missing. Check your credentials.',
      WABA_NOT_FOUND: 'WhatsApp Business account not found for this brand number. Verify in Sendiee Dashboard.',
      MISSING_RECIPIENT: 'Recipient phone number (To) is required.',
      INVALID_PHONE_NUMBER: 'The recipient phone number is invalid. Use full international format without +.',
      MISSING_TEMPLATE: 'Either Template Name or Template ID is required.',
      TEMPLATE_NOT_FOUND: 'Template not found or not in APPROVED status. Check your Sendiee Template Manager.',
      PARAMETER_VALIDATION_ERROR: 'Template parameter count does not match. Check Body/Header parameters match the template placeholders.',
      INVALID_SCHEDULE_TIME: 'Scheduled time must be in the future.',
      META_API_ERROR: `Meta WhatsApp API error: ${message}`,
      MESSAGE_NOT_FOUND: 'Message ID not found in this organisation.',
      SCHEDULE_NOT_CANCELLABLE: 'Cannot cancel — this message has already been sent or is currently being processed.',
    };

    throw new NodeApiError(this.getNode(), {
      message: friendlyMessages[code] || `Sendiee API Error [${code}]: ${message}`,
      description: `Error code: ${code}`,
    } as unknown as Error);
  }

  return response;
}
```

---

## 9. Error Handling

### Strategy

1. **Network errors** — caught by try/catch in `sendieeApiRequest`, re-thrown as `NodeApiError`
2. **Sendiee API errors** — `success: false` responses are intercepted and thrown with friendly messages
3. **Per-item errors** — the `execute()` method supports `continueOnFail()` so workflows can continue on individual item failures
4. **Validation errors** — n8n's `required: true` on properties handles most pre-flight validation

### Error Code → Message Map

All error codes and their friendly messages are in `GenericFunctions.ts`. When adding new API features, add new codes there.

### `continueOnFail` Pattern

Already implemented in the main `execute()` method. When enabled by the user in n8n, failed items get `{ error: "..." }` in their output instead of stopping the workflow.

---

## 10. Helper Utilities

No additional utilities are needed beyond `GenericFunctions.ts`. The API is straightforward enough that all logic lives in the handler functions.

---

## 11. Node Icons & Assets

### Icon Requirements

- **File:** `nodes/Sendiee/sendiee.svg`
- **Size:** 60×60px viewBox recommended
- **Format:** SVG only (n8n does not support PNG icons for community nodes)
- **Style:** Flat, single-colour or two-colour works best in n8n's UI (light + dark mode)

### Suggested Icon

Use the Sendiee logo if available as SVG, or a WhatsApp-style speech bubble icon in green (#25D366). Example minimal SVG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <circle cx="30" cy="30" r="30" fill="#25D366"/>
  <path d="M30 10C19 10 10 19 10 30c0 3.7 1 7.1 2.8 10L10 50l10.3-2.7C23 49 26.4 50 30 50c11 0 20-9 20-20S41 10 30 10z" fill="white"/>
  <path d="M24 22h2l3 7-2 2c1 2 3 4 5 5l2-2 7 3v2c-1 5-10 7-17-2s-5-14-2-15z" fill="#25D366"/>
</svg>
```

Place this file at `nodes/Sendiee/sendiee.svg` AND `credentials/sendiee.svg` (credentials reference it too).

---

## 12. Testing

### Manual Testing Checklist

Test every operation before publishing. Use the n8n desktop app or a local n8n Docker instance.

```bash
# Run local n8n with your node symlinked
cd ~/.n8n/custom
npm link /path/to/n8n-nodes-sendiee

# Or install directly
npm install /path/to/n8n-nodes-sendiee
```

#### Credentials
- [ ] Valid API key + brand number → credential test passes
- [ ] Invalid API key → shows "Invalid API key" error

#### Message: Send Template
- [ ] Send with template name → success, returns messageId
- [ ] Send with body parameters → parameters injected correctly
- [ ] Send with media URL for image header → success
- [ ] Send with invalid template name → shows TEMPLATE_NOT_FOUND error
- [ ] Send with schedule toggle on → returns scheduleId (201)
- [ ] Send with past scheduledAt → shows INVALID_SCHEDULE_TIME error

#### Message: Send Freeform
- [ ] Send text message → success
- [ ] Send image with caption → success
- [ ] Send document with filename → success
- [ ] Send audio → success (no caption field visible)

#### Message: Get Status
- [ ] Valid messageId → returns status object
- [ ] Invalid messageId → shows MESSAGE_NOT_FOUND error
- [ ] With retry: true → works

#### Contact: Create/Update
- [ ] New contact → isNew: true
- [ ] Existing phone → isNew: false, fields updated
- [ ] With custom fields → customFields object in response

#### Contact: Get by Phone
- [ ] Existing phone → returns contact
- [ ] Non-existent phone → 404 handled gracefully

#### Contact: Filter
- [ ] Filter by lead_category → returns filtered results
- [ ] Filter by city (partial match) → works
- [ ] Pagination page/limit → works

#### Contact: List All
- [ ] Returns paginated list

#### Scheduled Message: List
- [ ] No filter → all statuses returned
- [ ] Filter by status: scheduled → only scheduled

#### Scheduled Message: Get
- [ ] Valid scheduleId → returns details

#### Scheduled Message: Cancel
- [ ] Valid pending scheduleId → cancelled
- [ ] Already sent → shows SCHEDULE_NOT_CANCELLABLE error

#### continueOnFail
- [ ] Enable on node, trigger error → workflow continues, error in output

---

## 13. Publishing to npm

### Pre-publish Checklist

- [ ] `package.json` has `"n8n-community-node-package"` in keywords
- [ ] `n8n.credentials` and `n8n.nodes` point to `dist/` paths
- [ ] `files` in package.json includes `"dist"`
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes
- [ ] Version follows semver (start at `0.1.0`)
- [ ] README is complete (see Section 14)
- [ ] Icon SVG is present and valid

### Build & Publish Steps

```bash
# Build TypeScript
npm run build

# Dry run to see what would be published
npm publish --dry-run

# Publish to npm (must be logged in)
npm login
npm publish --access public
```

### Versioning

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Bug fix | Patch | 0.1.0 → 0.1.1 |
| New operation | Minor | 0.1.0 → 0.2.0 |
| Breaking change | Major | 0.1.0 → 1.0.0 |

---

## 14. README Template

```markdown
# n8n-nodes-sendiee

[n8n](https://n8n.io/) community node for [Sendiee](https://sendiee.com) — WhatsApp Business messaging.

Send WhatsApp template and freeform messages, manage contacts, and handle scheduled messages — without manually configuring HTTP nodes.

---

## Installation

In n8n: **Settings → Community Nodes → Install** → search `n8n-nodes-sendiee`

Or via CLI:
\`\`\`
npm install n8n-nodes-sendiee
\`\`\`

## Credentials

1. Go to your [Sendiee Dashboard](https://app.sendiee.com) → **Settings → API Keys**
2. Copy your API key
3. Copy your WhatsApp Business phone number (full international, no `+`)
4. In n8n: **Credentials → New → Sendiee API** → paste both

## Supported Operations

### Message
| Operation | Description |
|-----------|-------------|
| Send Template Message | Send an approved WhatsApp template |
| Send Freeform Message | Send text, image, document, audio, or video |
| Get Message Status | Check delivery status of a sent message |

### Contact
| Operation | Description |
|-----------|-------------|
| Create or Update | Upsert a contact by phone number |
| Get by Phone | Look up a contact by phone |
| Filter | Search contacts by any field |
| List All | Paginated list of all contacts |

### Scheduled Message
| Operation | Description |
|-----------|-------------|
| List | View scheduled messages (filter by status) |
| Get | Get details of a specific scheduled message |
| Cancel | Cancel a pending scheduled message |

## Example Workflows

- **Shopify order confirmed → Send WhatsApp template** with order details
- **Typeform submitted → Upsert contact → Send welcome message**
- **Google Sheets row added → Create Sendiee contact**

## Resources

- [Sendiee API Documentation](https://docs.sendiee.com)
- [n8n Community Nodes Guide](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
```

---

## 15. Critical Rules & Gotchas

### MUST Follow

1. **`"n8n-community-node-package"` keyword in package.json is mandatory.** Without it, the node won't appear in n8n's community node installer.

2. **`files: ["dist"]` in package.json.** Only the compiled `dist/` folder should be published to npm. Source TypeScript is not needed by end users.

3. **`n8n` section in package.json must point to `dist/` paths**, not the source `nodes/` or `credentials/` paths.

4. **Icon must be `.svg` format.** n8n does not support PNG icons for community nodes. Place the SVG file both in `nodes/Sendiee/` AND copy to `credentials/`.

5. **`noDataExpression: true` on Resource and Operation selectors.** This prevents n8n from trying to evaluate them as expressions, which would break the dropdowns.

6. **The `execute()` function must return `INodeExecutionData[][]`** (array of arrays) — the outer array is for multiple outputs; most nodes have one output so it's `[returnData]`.

7. **Never hardcode the API key.** Always use `this.getCredentials('sendieeApi')` at runtime.

8. **`brandNumber` comes from credentials by default.** The override field on each operation should fall back to `credentials.brandNumber` when left blank.

9. **Empty objects on GET/DELETE bodies.** The `sendieeApiRequest` helper strips the body for GET and DELETE requests to avoid API rejections.

10. **`fixedCollection` with `multipleValues: true`** is the correct n8n UI pattern for the template parameters arrays. Do NOT use `json` type fields for this — it creates bad UX.

### Common Mistakes to Avoid

| Mistake | Correct Approach |
|---------|-----------------|
| Throwing errors without `NodeApiError` | Always use `NodeApiError` or `NodeOperationError` |
| Returning raw response instead of `response.data` | Unwrap the Sendiee envelope: return `response.data` |
| Not handling `continueOnFail` | The try/catch pattern in `execute()` must check `this.continueOnFail()` |
| Forgetting `displayOptions.show` on every field | Every field needs `displayOptions` — without it, it shows for all resources/operations |
| Using `type: 'json'` for parameter arrays | Use `fixedCollection` with `multipleValues: true` |
| Publishing source files | Only `dist/` goes to npm — check `files` in package.json |
| Missing `outDir: "./dist"` in tsconfig | Build artifacts must go to `dist/` to match the `n8n` section in package.json |

### Sendiee-Specific API Behaviour

- **`success: false` does not always mean an HTTP error status.** Always check the `success` field in the response body, not just the HTTP status code.
- **Templates must be in APPROVED status** in Sendiee/Meta before they can be sent. A `TEMPLATE_NOT_FOUND` error often means the template isn't approved yet.
- **24-hour window rule** applies to freeform messages only. Templates can be sent any time. Mention this in field descriptions to set user expectations.
- **`isNew` flag in contact upsert** is important for downstream workflow logic (e.g. only send welcome message to new contacts). Make sure it's surfaced in the output.
- **Scheduled messages return `scheduleId` not `messageId`.** The response shape changes when scheduling (201 Created vs 200 OK). Both are returned as the node output; users can use `{{ $json.scheduleId }}` vs `{{ $json.messageId }}` downstream.
- **Rate limits**: Free/Starter = 60 req/min, Business = 200 req/min. Advise users to use n8n's built-in rate limiting (Batch node + wait) for bulk operations.

---

*End of implementation guide. This document contains everything needed to build, test, and publish the `n8n-nodes-sendiee` community node.*