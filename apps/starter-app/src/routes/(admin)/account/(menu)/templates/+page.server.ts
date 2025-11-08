import type { PageServerLoad } from "./$types"
import { getUserDefaultOrgId, getUserOrgTemplateDocs } from "@templetto/firebase/repositories/user"

export const load: PageServerLoad = async ({ locals: { firebaseUser } }) => {
  if (!firebaseUser) {
    return {
      templates: [],
    }
  }

  const userDefaultOrgId = await getUserDefaultOrgId({
    userId: firebaseUser.uid,
  })

  if (!userDefaultOrgId) {
    return {
      templates: [],
    }
  }

  const templates = await getUserOrgTemplateDocs({
    uid: firebaseUser.uid,
    orgId: userDefaultOrgId,
    sortByCreatedAt: "desc",
  })

  return {
    templates,
  }
}

