const appInsights = require("applicationinsights");

const winston = require("winston");
// Transport for Azure Insights
class ApplicationInsightsTransport extends winston.Transport {
  constructor(options) {
    super(options);
    this.name = "ApplicationInsightsTransport";
  }

  log(info, callback) {
    const logData = {
      message: info.message,
      severity: info.level,
      timestamp: info.timestamp,
      properties: {
        label: info.label,
      },
    };

    appInsights.defaultClient.trackEvent({
      name: "Log",
      properties: logData,
    });

    callback();
  }
}

// Application Insights Exception Handler
function trackException(err) {
  appInsights.defaultClient.trackException({
    exception: err,
    properties: {
      message: err.message,
      stack: err.stack,
    },
  });
}

// Log Configuration
const logConfiguration = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.label({
      label: `Label🏷️`
    }),
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf(
      (info) =>
        `${info.level}: ${info.label}: [${info.timestamp}]: ${info.message}`
    )
  )
};

// Initialize Application Insights
async function initializeApplicationInsights(instrumentationKey,RoleName=null) {
  return new Promise((resolve,reject)=>{
    try{
      appInsights.setup(instrumentationKey)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setSendLiveMetrics(true).start();
      appInsights.defaultClient.config.samplingPercentage = 100;
      if(RoleName) appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = RoleName;
      logConfiguration.transports.push(new ApplicationInsightsTransport());
      resolve(true)
      }catch(err){
        reject(err)
      }
  })
}

// Create Logger
const logger = winston.createLogger(logConfiguration);

module.exports = { initializeApplicationInsights, logger };
