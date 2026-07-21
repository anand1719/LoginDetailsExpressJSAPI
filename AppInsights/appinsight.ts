import appInsight from "applicationinsights";

export function setupAppInsights() {
  appInsight.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "")
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true,false)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoDependencyCorrelation(true)
    .setUseDiskRetryCaching(true)
    .start();
}