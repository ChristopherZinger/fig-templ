import { readable } from "svelte/store";

const shouldEnableApiCalls = process.env.SHOULD_ENABLE_API_CALLS;

const featuresStore = readable({
  apiCalls: shouldEnableApiCalls,
});

export { featuresStore };
