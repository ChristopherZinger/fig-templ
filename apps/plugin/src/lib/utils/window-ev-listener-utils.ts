export function getMessageEventListener(cb: (event: MessageEvent) => void) {
  window.addEventListener("message", cb);
  return () => window.removeEventListener("message", cb);
}
