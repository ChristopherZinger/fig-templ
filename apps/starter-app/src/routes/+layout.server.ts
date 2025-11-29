import { NODE_ENV } from "$env/static/private"
import { redirect } from "@sveltejs/kit"

export const load = ({ request }) => {
  if (NODE_ENV === "production" && !request.url.includes("coming-soon")) {
    return redirect(307, "/coming-soon")
  }
}
