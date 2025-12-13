import { fail } from "@sveltejs/kit"
import z from "zod"
import { createContactUsMessage } from "@templetto/firebase/repositories/contact-us-message"
import { log } from "@templetto/logging"

export const actions = {
  submitContactUs: async ({ request }) => {
    try {
      const formData = await request.formData()
      const email = formData.get("email")
      const phone = formData.get("phone")
      const company = formData.get("company")
      const fullName = formData.get("fullName")
      const message = formData.get("message")

      const parsingResult = z
        .object({
          email: z.email(),
          phone: z.string().optional(),
          company: z.string().optional(),
          fullName: z.string().min(1, "Full name is required"),
          message: z.string().min(1, "Message is required"),
        })
        .safeParse({ email, phone, company, fullName, message })

      if (!parsingResult.success) {
        const errors: Record<string, string> = {}
        parsingResult.error.issues.forEach((issue) => {
          const fieldName = issue.path[0]
          if (fieldName && typeof fieldName === "string") {
            errors[fieldName] = issue.message
          }
        })
        return fail(400, { errors })
      }

      await createContactUsMessage({
        email: parsingResult.data.email,
        phone: parsingResult.data.phone ?? undefined,
        company: parsingResult.data.company ?? undefined,
        fullName: parsingResult.data.fullName,
        message: parsingResult.data.message,
      })

      return { success: true }
    } catch (error) {
      log.error("error_creating_contact_us_message", error)
      return fail(500, { error: "An unexpected error occurred" })
    }
  },
}
