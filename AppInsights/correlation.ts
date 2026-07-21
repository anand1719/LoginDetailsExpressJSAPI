import appInsights from "applicationinsights";

export function getCorrelationId(): string | undefined {
  try {
    const client = appInsights.defaultClient;
    if (!client || !client.context) {
      return undefined;
    }
    return client.context.tags[
      client.context.keys.operationId
    ];
  } catch (error) {
    console.error("Error getting correlation ID:", error);
    return undefined;
  }
}


