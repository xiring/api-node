# OpenTelemetry Tracing (Scaffold)

Basic tracing is wired via `src/config/otel.js`. It uses Node auto-instrumentations (HTTP, etc.).

## Enable
Set env vars and restart the server:

```bash
# Install deps (optional; only if you enable OTEL)
npm i -S @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/resources @opentelemetry/semantic-conventions

OTEL_ENABLED=true
OTEL_SERVICE_NAME=logistics-api
# Example OTLP exporter (if you add it):
# OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
# OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
```

Note: The scaffold does not configure an exporter by default to avoid extra dependencies. If you need OTLP, install `@opentelemetry/exporter-trace-otlp-http` and configure the SDK accordingly.
