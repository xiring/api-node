// Minimal OpenTelemetry tracing scaffold (lazy import; no exporters by default)
let NodeSDK;
let getNodeAutoInstrumentations;
let Resource;
let SEMRESATTRS_SERVICE_NAME;

let sdk;

async function initOtel() {
  if (process.env.OTEL_ENABLED !== 'true') return null;
  if (sdk) return sdk;

  try {
    ({ NodeSDK } = require('@opentelemetry/sdk-node'));
    ({ getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node'));
    ({ Resource } = require('@opentelemetry/resources'));
    ({ SEMRESATTRS_SERVICE_NAME } = require('@opentelemetry/semantic-conventions'));
  } catch (e) {
    console.warn('OpenTelemetry not enabled: missing packages. Install @opentelemetry/sdk-node and auto-instrumentations.');
    return null;
  }

  const sdkConfig = { instrumentations: [getNodeAutoInstrumentations()] };
  try {
    if (Resource) {
      const serviceNameKey = SEMRESATTRS_SERVICE_NAME || 'service.name';
      sdkConfig.resource = new Resource({
        [serviceNameKey]: process.env.OTEL_SERVICE_NAME || 'api-node',
      });
    }
  } catch (_) {
    // If Resource ctor not available, skip custom resource
  }

  sdk = new NodeSDK(sdkConfig);
  await sdk.start();
  return sdk;
}

async function shutdownOtel() {
  if (sdk) await sdk.shutdown();
}

module.exports = { initOtel, shutdownOtel };


