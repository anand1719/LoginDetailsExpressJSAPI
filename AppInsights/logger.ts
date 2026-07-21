import * as appInsights from "applicationinsights";
import { getCorrelationId } from "./correlation.ts";

export function logCheckpoint(
  name: string,
  meta?: Record<string, any>
) {
  const client = appInsights.defaultClient;
  
  if (!client || !client.trackTrace) {
    console.log(`Checkpoint: ${name}`, meta);
    return;
  }

  client.trackTrace({
    message: `Checkpoint: ${name}`,
    properties: {
      ...meta,
      checkpoint: name,
      correlationId: getCorrelationId(),
    },
  });
}
