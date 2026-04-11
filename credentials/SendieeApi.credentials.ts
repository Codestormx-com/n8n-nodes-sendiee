import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class SendieeApi implements ICredentialType {
  name = 'sendieeApi';
  displayName = 'Sendiee API';
  documentationUrl = 'https://docs.sendiee.com';
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
