import { getUsersTemplate } from "$lib/server/firebase-queries"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ locals: { firebaseUser } }) => {
  // Session here is from authGuard hook
  if (!firebaseUser) {
    return {
      firebaseUser: null,
      userTemplates: [],
    }
  }
  const userTemplates = await getUsersTemplate(firebaseUser.uid)

  return {
    firebaseUser,
    userTemplates,
  }
}
