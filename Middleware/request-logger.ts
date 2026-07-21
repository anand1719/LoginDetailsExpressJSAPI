// //import type { Request, Response, NextFunction } from "express";
// const express = require("express");
// const appInsights = require("applicationinsights");
// const { getCorrelationId } = require("../AppInsights/correlation.ts");

// const client = appInsights.defaultClient;

// function requestLogger(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   const correlationId = getCorrelationId();
//     //client.context.tags[client.context.keys.operationId];

//   // attach to request for later use
//   (req as any).correlationId = correlationId;

//   client.trackTrace({
//     message: "Incoming request",
//     properties: {
//       method: req.method,
//       path: req.originalUrl,
//       ip: req.ip,
//       correlationId,
//     },
//   });
//   next();
// }

// module.exports = requestLogger;