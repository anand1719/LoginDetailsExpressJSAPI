const appInsights = require("applicationinsights");
const correlationIdService = require("./correlation-id-service.js");

/**
 * Get correlation ID from Application Insights or fallback to service
 */
function getCorrelationId() {
  // Try to get from AppInsights first
  const appInsightsId = correlationIdService.getFromAppInsights();
  if (appInsightsId) {
    return appInsightsId;
  }
  
  // If not available, it should have been set by request-logger middleware
  // This is a fallback only
  return undefined;
}

/**
 * Gets the full trace context including operation name
 */
function getTraceContext() {
  try {
    const client = appInsights.defaultClient;
    if (!client || !client.context) {
      return {};
    }
    
    return {
      operationId: client.context.tags[client.context.keys.operationId],
      operationName: client.context.tags[client.context.keys.operationName],
      parentId: client.context.tags[client.context.keys.operationParentId],
    };
  } catch (error) {
    return {};
  }
}

/**
 * Log a checkpoint with automatic correlation ID tracking
 * Usage: logCheckpoint('User Login', { userId: 123, status: 'success' })
 * The correlation ID will be automatically included and visible in Application Insights
 */
function logCheckpoint(name, meta = {}) {
  const client = appInsights.defaultClient;
  
  if (!client || !client.trackTrace) {
    // Fallback to console logging
    const correlationId = getCorrelationId();
    console.log(`[${new Date().toISOString()}] Checkpoint: ${name}`, {
      ...meta,
      correlationId,
    });
    return;
  }

  const correlationId = getCorrelationId();
  const traceContext = getTraceContext();

  client.trackTrace({
    message: `Checkpoint: ${name}`,
    severity: appInsights.defaultClient.commonProperties?.severity || 1, // Info level
    properties: {
      checkpoint: name,
      correlationId,
      operationId: traceContext.operationId,
      operationName: traceContext.operationName,
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

module.exports = { logCheckpoint, getCorrelationId, getTraceContext };
