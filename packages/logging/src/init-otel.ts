/*instrumentation.ts*/
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { TraceExporter } from "@google-cloud/opentelemetry-cloud-trace-exporter";

const SERVICE_NAME = process.env.SERVICE_NAME || "templetto";

const sdk = new NodeSDK({
  serviceName: SERVICE_NAME,
  traceExporter: new TraceExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
