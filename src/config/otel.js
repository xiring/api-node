// Minimal OpenTelemetry tracing scaffold (lazy import; no exporters by default)
let NodeSDK;
let getNodeAutoInstrumentations;
let Resource;
let SemanticResourceAttributes;

let sdk;

async function initOtel() {
  if (process.env.OTEL_ENABLED !== 'true') return null;
  if (sdk) return sdk;

  try {
    ({ NodeSDK } = require('@opentelemetry/sdk-node'));
    ({ getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node'));
    ({ Resource } = require('@opentelemetry/resources'));
    ({ SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions'));
  } catch (e) {
    console.warn('OpenTelemetry not enabled: missing packages. Install @opentelemetry/sdk-node and auto-instrumentations.');
    return null;
  }

  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'api-node',
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  await sdk.start();
  return sdk;
}

async function shutdownOtel() {
  if (sdk) await sdk.shutdown();
}

module.exports = { initOtel, shutdownOtel };


