import z from "zod";

export const puppeteerWorkerRequestSchema = z.object({
  templateId: z.string(),
});

export type PuppeteerWorkerRequest = z.infer<
  typeof puppeteerWorkerRequestSchema
>;
