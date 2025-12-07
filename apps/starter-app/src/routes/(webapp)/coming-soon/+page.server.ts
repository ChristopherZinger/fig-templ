import { fail } from "@sveltejs/kit"
import type { Actions } from "./$types"
import z from "zod"
import { upsertEmailSubscription } from "@templetto/firebase/repositories/email-subscription"

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData()
    const email = formData.get("email")

    const result = z.string().email().safeParse(email)
    if (!result.success) {
      return fail(400, {
        error: "Invalid email",
      })
    }

    await upsertEmailSubscription({ email: result.data })

    return {
      success: true,
      email: email,
    }
  },
} satisfies Actions
