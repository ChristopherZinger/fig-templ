import { getUsersTemplate } from "$lib/server/firebase-queries"
import { getUserDefaultOrgId } from "@templetto/firebase/repositories/user"
import type { LayoutServerLoad } from "./$types"
import { getOrgById } from "../../../../../../packages/firebase/src/repositories/organization"

export const load: LayoutServerLoad = async ({ locals: { firebaseUser } }) => {
  // Session here is from authGuard hook
  if (!firebaseUser) {
    return {
      firebaseUser: null,
      userTemplates: [],
    }
  }
  const userDefaultOrgId = await getUserDefaultOrgId({
    userId: firebaseUser.uid,
  })

  const userDefaultOrg = userDefaultOrgId
    ? await getOrgById(userDefaultOrgId)
    : null

  const userTemplates = await getUsersTemplate(firebaseUser.uid)

  return {
    currentOrg: userDefaultOrg,
    firebaseUser,
    userTemplates,
  }
}
