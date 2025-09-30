import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { AppEnv } from './env';

let telemetrySdk: NodeSDK | null = null;

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

export async function startTelemetry(env: AppEnv) {
  if (!env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    return null;
  }

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'ondeclick-api',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'rotacomercial',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.NODE_ENV,
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0'
  });

  const traceExporter = new OTLPTraceExporter({
    url: env.OTEL_EXPORTER_OTLP_ENDPOINT
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: env.OTEL_EXPORTER_OTLP_ENDPOINT }),
    exportIntervalMillis: 15_000
  });

  telemetrySdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader
  });

  await telemetrySdk.start();
  return telemetrySdk;
}

export async function stopTelemetry() {
  if (!telemetrySdk) return;

  await telemetrySdk.shutdown();
  telemetrySdk = null;
}
