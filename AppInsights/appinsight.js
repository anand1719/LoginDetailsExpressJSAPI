const appInsight = require("applicationinsights");

function setupAppInsights() {
  const instrumentationKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
  
  if (!instrumentationKey) {
    console.warn("WARNING: APPINSIGHTS_INSTRUMENTATIONKEY not set. AppInsights will not work.");
    return;
  }

  try {
    // Convert instrumentationKey to connection string for SDK 3.X
    const connectionString = `InstrumentationKey=${instrumentationKey}`;
    
    appInsight
      .setup(connectionString)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, false)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoDependencyCorrelation(true)
      .setUseDiskRetryCaching(true)
      .start();
    
    console.log("✓ AppInsights initialized successfully with SDK 3.X");
  } catch (error) {
    console.error("ERROR: Failed to initialize AppInsights:", error.message);
  }
}

// Verify client is available
function isAppInsightsReady() {
  return appInsight.defaultClient !== undefined;
}

module.exports = { setupAppInsights, isAppInsightsReady };
