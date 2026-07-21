const { randomUUID } = require('crypto');
const appInsights = require("applicationinsights");

/**
 * Correlation ID Service
 * Generates and manages correlation IDs for request tracing
 * Priority: Header → AppInsights → Generate New
 */

const CORRELATION_ID_HEADERS = [
  'x-correlation-id',
  'x-request-id',
  'traceparent',
  'correlation-id',
  'request-id'
];

/**
 * Extract correlation ID from request headers
 */
function extractFromHeaders(req) {
  for (const header of CORRELATION_ID_HEADERS) {
    const value = req.headers[header];
    if (value) {
      return value;
    }
  }
  return null;
}

/**
 * Get correlation ID from Application Insights context
 */
function getFromAppInsights() {
  try {
    const client = appInsights.defaultClient;
    if (!client || !client.context || !client.context.tags) {
      return null;
    }
    
    const operationId = client.context.tags[
      client.context.keys.operationId
    ];
    
    if (operationId) {
      return operationId;
    }
    
    return client.context.tags[
      client.context.keys.operationParentId
    ];
  } catch (error) {
    return null;
  }
}

/**
 * Generate a new correlation ID using UUID v4 (built-in crypto module)
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function generateNew() {
  return randomUUID();
}

/**
 * Get or create correlation ID for a request
 * Priority: Header → AppInsights → Generate New
 */
function getOrCreate(req) {
  // 1. Try to get from request headers (for distributed tracing)
  const headerId = extractFromHeaders(req);
  if (headerId) {
    console.log(`✓ Correlation ID from header: ${headerId}`);
    return headerId;
  }

  // 2. Try to get from Application Insights
  const appInsightsId = getFromAppInsights();
  if (appInsightsId) {
    console.log(`✓ Correlation ID from AppInsights: ${appInsightsId}`);
    return appInsightsId;
  }

  // 3. Generate a new correlation ID
  const newId = generateNew();
  console.log(`✓ Generated new Correlation ID: ${newId}`);
  return newId;
}

/**
 * Set correlation ID in response headers for downstream services
 */
function setResponseHeader(res, correlationId) {
  res.setHeader('x-correlation-id', correlationId);
  res.setHeader('x-request-id', correlationId);
}

module.exports = {
  getOrCreate,
  generateNew,
  extractFromHeaders,
  getFromAppInsights,
  setResponseHeader,
};
