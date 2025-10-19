import { writable } from "svelte/store";

const _sessionTokenStore = writable<string | null | undefined>(undefined);

export const sessionTokenStore = {
  subscribe: _sessionTokenStore.subscribe,

  set: (sessionToken: string | null) => {
    _sessionTokenStore.set(sessionToken);
  },
};
