import {
  IExecuteFunctions,
  IHttpRequestMethods,
  IDataObject,
  ILoadOptionsFunctions,
  JsonObject,
  NodeApiError,
} from 'n8n-workflow';

/**
 * Central HTTP helper for all Sendiee API calls.
 * Handles auth injection, error mapping, and response unwrapping.
 *
 * The `this` is typed to accept both `IExecuteFunctions` (used by the
 * regular execute() pipeline) and `ILoadOptionsFunctions` (used by
 * dynamic dropdown loaders). Both expose `getCredentials`,
 * `helpers.httpRequest`, and `getNode()`, so the body of this function
 * doesn't need to change.
 */
export async function sendieeApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
): Promise<IDataObject> {
  const credentials = await this.getCredentials('sendieeApi');

  const options: {
    method: IHttpRequestMethods;
    baseURL: string;
    url: string;
    headers: Record<string, string>;
    qs: IDataObject;
    body?: IDataObject;
    json: boolean;
  } = {
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
  };

  // Remove empty body for GET/DELETE
  if (['GET', 'DELETE'].includes(method)) {
    delete options.body;
  }

  let response: IDataObject;

  try {
    response = await this.helpers.httpRequest(options);
  } catch (error) {
    // Re-throw n8n NodeApiError for network-level failures
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }

  // Sendiee always returns { success: boolean, ... }
  if (response.success === false) {
    const code = (response.code as string) || 'UNKNOWN_ERROR';
    const message = (response.message as string) || 'Unknown error from Sendiee API';

    // Map Sendiee error codes to friendly n8n messages
    const friendlyMessages: Record<string, string> = {
      API_KEY_MISSING: 'API key is missing. Check your Sendiee credentials.',
      INVALID_API_KEY:
        'Invalid API key. Regenerate it in Sendiee Dashboard → Settings → API Keys.',
      ORG_INACTIVE: 'Your Sendiee organisation is inactive. Contact Sendiee support.',
      BRAND_NUMBER_MISSING:
        'Brand number (WhatsApp Business phone) is missing. Check your credentials.',
      WABA_NOT_FOUND:
        'WhatsApp Business account not found for this brand number. Verify in Sendiee Dashboard.',
      MISSING_RECIPIENT: 'Recipient phone number (To) is required.',
      INVALID_PHONE_NUMBER:
        'The recipient phone number is invalid. Use full international format without +.',
      MISSING_TEMPLATE: 'Either Template Name or Template ID is required.',
      TEMPLATE_NOT_FOUND:
        'Template not found or not in APPROVED status. Check your Sendiee Template Manager.',
      PARAMETER_VALIDATION_ERROR:
        'Template parameter count does not match. Check Body/Header parameters match the template placeholders.',
      INVALID_SCHEDULE_TIME: 'Scheduled time must be in the future.',
      META_API_ERROR: `Meta WhatsApp API error: ${message}`,
      MESSAGE_NOT_FOUND: 'Message ID not found in this organisation.',
      SCHEDULE_NOT_CANCELLABLE:
        'Cannot cancel — this message has already been sent or is currently being processed.',
      DOMAIN_NOT_WHITELISTED: 'Request origin domain not in allowed list.',
      MISSING_CONTENT: 'Message content is empty or missing.',
      MISSING_TEXT_BODY: 'Text message missing body field.',
      MISSING_MEDIA_LINK: 'Media message missing link field.',
      MESSAGE_SEND_FAILED: 'Internal error sending message. Please try again.',
    };

    throw new NodeApiError(
      this.getNode(),
      {
        message: friendlyMessages[code] || `Sendiee API Error [${code}]: ${message}`,
        description: `Error code: ${code}`,
      } as JsonObject,
    );
  }

  return response;
}
