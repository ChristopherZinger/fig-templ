import { error } from "@sveltejs/kit"
import z from "zod"
import { createContactUsMessage } from "@templetto/firebase/repositories/contact-us-message"

/** @type {import('./$types').Actions} */
export const actions = {
  submitContactUs: async ({ request }) => {
    const formData = await request.formData()
    const email = formData.get("email")
    const phone = formData.get("phone")
    const company = formData.get("company")
    const fullName = formData.get("fullName")
    const message = formData.get("message")

    const parsingResult = z
      .object({
        email: z.string(),
        phone: z.string().optional(),
        company: z.string().optional(),
        fullName: z.string(),
        message: z.string(),
      })
      .safeParse({ email, phone, company, fullName, message })

    if (!parsingResult.success) {
      return error(400, "Bad Request")
    }

    await createContactUsMessage({
      email: parsingResult.data.email,
      phone: parsingResult.data.phone ?? undefined,
      company: parsingResult.data.company ?? undefined,
      fullName: parsingResult.data.fullName,
      message: parsingResult.data.message,
    })
  },
}
