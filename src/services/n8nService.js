import axios from 'axios';

/**
 * Service to communicate with the n8n Chatbot Webhook using Axios
 */

/**
 * Checks if the n8n webhook URL is configured
 */
export function isWebhookConfigured() {
  const url = import.meta.env.VITE_N8N_WEBHOOK_URL;
  return Boolean(url && url.trim().length > 0 && !url.includes('your-n8n-webhook-url-here'));
}

/**
 * Gets the configured webhook URL (or null)
 */
export function getWebhookUrl() {
  return import.meta.env.VITE_N8N_WEBHOOK_URL || '';
}

/**
 * Recursively parses and extracts the text answer from various n8n response shapes.
 * Handles:
 * - String: "Hello!"
 * - Object: { output: "..." }, { text: "..." }, { response: "..." }, { message: "..." }, { answer: "..." }, { content: "..." }
 * - Nested objects: { data: { output: "..." } }, { body: { response: "..." } }
 * - Array: [{ output: "..." }] or [{ json: { text: "..." } }]
 */
export function extractTextFromResponse(data) {
  if (data === null || data === undefined) {
    return 'No response content returned by workflow.';
  }

  // Already a string
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) return 'Workflow returned an empty response.';

    // Check if the string is stringified JSON
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return extractTextFromResponse(parsed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  // If array, inspect first element or join outputs
  if (Array.isArray(data)) {
    if (data.length === 0) return 'Workflow returned an empty list.';

    // Check if items have text/output properties
    const extractedItems = data.map((item) => extractTextFromResponse(item)).filter(Boolean);
    if (extractedItems.length > 0) {
      return extractedItems.join('\n\n');
    }
    return JSON.stringify(data, null, 2);
  }

  // If object, search for common n8n AI response keys
  if (typeof data === 'object') {
    const candidateKeys = [
      'output',
      'text',
      'response',
      'message',
      'content',
      'answer',
      'result',
      'reply',
      'chatOutput',
    ];

    for (const key of candidateKeys) {
      if (key in data && data[key] !== null && data[key] !== undefined) {
        if (typeof data[key] === 'string' && data[key].trim().length > 0) {
          return data[key].trim();
        }
        if (typeof data[key] === 'object') {
          const nested = extractTextFromResponse(data[key]);
          if (nested) return nested;
        }
      }
    }

    // Check for nested wrapper objects commonly used in n8n (e.g. data.json, data.body, data.data)
    if (data.json) return extractTextFromResponse(data.json);
    if (data.body) return extractTextFromResponse(data.body);
    if (data.data) return extractTextFromResponse(data.data);

    // Fallback: If object contains a single string value
    const values = Object.values(data);
    const stringValues = values.filter((v) => typeof v === 'string' && v.trim().length > 0);
    if (stringValues.length === 1) {
      return stringValues[0].trim();
    }

    // Fallback: format clean readable JSON without crashing
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  return String(data);
}

/**
 * Sends a chat message to the configured n8n webhook using Axios
 *
 * @param {Object} params
 * @param {string} params.message - The text message sent by the user
 * @param {string} params.sessionId - Unique chat session ID for n8n memory nodes
 * @param {Array} [params.history] - Optional chat history context
 * @param {File|null} [params.attachment] - Optional file attachment
 * @param {AbortSignal} [params.signal] - Optional abort signal
 * @returns {Promise<string>} The assistant's response text
 */
export async function sendMessageToN8n({ message, sessionId, history = [], attachment = null, signal }) {
  const webhookUrl = getWebhookUrl();

  if (!webhookUrl || !webhookUrl.trim()) {
    throw new Error(
      'MISSING_WEBHOOK_URL: n8n webhook URL is not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file and restart Vite.'
    );
  }

  // Validate URL format
  let parsedUrl;
  try {
    parsedUrl = new URL(webhookUrl);
  } catch {
    throw new Error(
      `INVALID_WEBHOOK_URL: The configured URL "${webhookUrl}" is not a valid URL. Please check your .env file.`
    );
  }

  let requestData;
  let requestHeaders;

  if (attachment) {
    // ── Multipart/form-data when a file is attached ──
    // Field layout:
    //   message      → text
    //   chatInput    → text  (alias for n8n Chat Trigger compatibility)
    //   sessionId    → text
    //   timestamp    → text
    //   history      → JSON string
    //   data         → binary file (the attachment itself)
    const form = new FormData();
    form.append('message', message.trim());
    form.append('chatInput', message.trim());
    form.append('sessionId', sessionId || 'default_session');
    form.append('timestamp', new Date().toISOString());
    form.append(
      'history',
      JSON.stringify(
        Array.isArray(history)
          ? history.map((h) => ({ role: h.role, content: h.content }))
          : []
      )
    );
    // Binary file under the field name "data"
    form.append('data', attachment, attachment.name);

    requestData = form;
    // Let axios set Content-Type with the correct multipart boundary automatically
    requestHeaders = {
      Accept: 'application/json, text/plain, */*',
    };
  } else {
    // ── JSON when no file is attached ──
    requestData = {
      message: message.trim(),
      chatInput: message.trim(),
      sessionId: sessionId || 'default_session',
      history: Array.isArray(history)
        ? history.map((h) => ({ role: h.role, content: h.content }))
        : [],
      timestamp: new Date().toISOString(),
    };
    requestHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
    };
  }

  try {
    const response = await axios.post(parsedUrl.toString(), requestData, {
      headers: requestHeaders,
      signal,
    });

    return extractTextFromResponse(response.data);
  } catch (error) {
    // Handle cancel / abort
    if (axios.isCancel(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
      throw new Error('Request was cancelled.', { cause: error });
    }

    // Handle HTTP error responses from server (404, 500, etc.)
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      const errorDetails = responseData
        ? typeof responseData === 'string'
          ? `: ${responseData.slice(0, 200)}`
          : `: ${JSON.stringify(responseData).slice(0, 200)}`
        : '';

      if (status === 404) {
        throw new Error(
          'HTTP 404: Webhook endpoint not found. Ensure your n8n workflow is turned ON (Active) or test webhook is currently listening.',
          { cause: error }
        );
      }

      if (status === 500) {
        throw new Error(
          `HTTP 500: n8n workflow encountered an internal error${errorDetails}. Check your n8n execution log for details.`,
          { cause: error }
        );
      }

      throw new Error(
        `Webhook error (${status} ${error.response.statusText || 'Error'})${errorDetails}`,
        { cause: error }
      );
    }

    // Handle network / CORS errors (request sent but no response received)
    if (error.request || error.code === 'ERR_NETWORK') {
      throw new Error(
        'NETWORK_OR_CORS_ERROR: Unable to connect to n8n webhook. This usually occurs if n8n is offline, unreachable, or CORS is blocked by the browser. If self-hosting n8n, ensure N8N_DEFAULT_BINARY_DATA_MODE and CORS settings allow requests from your frontend origin.',
        { cause: error }
      );
    }

    // Re-throw our customized errors or general errors
    throw error;
  }
}
