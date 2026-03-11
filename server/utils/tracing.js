/**
 * Phase P2: OpenTelemetry Tracing Setup
 * Must be required at the VERY TOP of the application entrypoints.
 */
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

// Exporter configured for standard OTLP HTTP receiver (e.g. Jaeger, Datadog Agent, Signoz)
const traceExporter = new OTLPTraceExporter({
    url: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    // headers: { 'api-key': 'your-api-key' }
});

const sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME || 'ecokids-backend',
    traceExporter,
    instrumentations: [
        getNodeAutoInstrumentations({
            // Disable noisy instrumentations if needed
            '@opentelemetry/instrumentation-fs': { enabled: false },
        })
    ],
});

try {
    sdk.start();
    console.log('[OpenTelemetry] Tracing initialized successfully.');
} catch (error) {
    console.error('[OpenTelemetry] Error initializing tracing:', error);
}

// Ensure the tracing system flushes before shutdown
process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('[OpenTelemetry] Tracing terminated'))
        .catch((error) => console.log('[OpenTelemetry] Error terminating tracing', error))
        .finally(() => process.exit(0));
});
