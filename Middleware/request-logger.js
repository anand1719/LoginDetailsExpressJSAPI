const appInsights = require("applicationinsights");
const correlationIdService = require("../AppInsights/correlation-id-service.js");

function requestLogger(req, res, next) {
  const client = appInsights.defaultClient;
  
  // Get or create correlation ID for this request
  // Priority: Headers → AppInsights → Generate New UUID
  const correlationId = correlationIdService.getOrCreate(req);
  
  // Attach to request object for use in route handlers
  req.correlationId = correlationId;
  req.appInsightsClient = client;
  
  // Set correlation ID in response headers for downstream services
  correlationIdService.setResponseHeader(res, correlationId);

  // Track incoming request
  if (client && client.trackTrace) {
    client.trackTrace({
      message: `Incoming request: ${req.method} ${req.path}`,
      severity: 0, // Verbose level
      properties: {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        correlationId,
        timestamp: new Date().toISOString(),
      },
    });
  }
  
  next();
}

module.exports = requestLogger;
