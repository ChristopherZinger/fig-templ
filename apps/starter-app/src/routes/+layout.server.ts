import { NODE_ENV } from "$env/static/private"
import { error, redirect } from "@sveltejs/kit"
import {
  getBackendConfigFlag,
  BackendConfigFlag,
} from "@templetto/firebase/repositories/backend-config-flags"

export const load = async () => {
  const [isForcedShoutDown, isComingSoon] = await Promise.all([
    getBackendConfigFlag(BackendConfigFlag.isForcedShoutDown),
    getBackendConfigFlag(BackendConfigFlag.isComingSoon),
  ])

  if (
    NODE_ENV === "production" &&
    (isComingSoon === null || isComingSoon === true)
  ) {
    return redirect(307, "/coming-soon")
  }

  if (
    NODE_ENV === "production" &&
    (isForcedShoutDown === null || isForcedShoutDown === true)
  ) {
    return error(
      500,
      "Service is currently down for maintenance. Please try again later.",
    )
  }
}
