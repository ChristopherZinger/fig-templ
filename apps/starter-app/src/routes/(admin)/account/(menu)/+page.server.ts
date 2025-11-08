import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import { getUsersTemplate } from "$lib/server/firebase-queries"
import {
  getUserDefaultOrgId,
  getUserOrgTemplateDocs,
} from "@templetto/firebase/repositories/user"
import { getOrgById } from "../../../../../../../packages/firebase/src/repositories/organization"

export const actions = {
  // signout: async ({ locals: { supabase, safeGetSession } }) => {
  //   const { session } = await safeGetSession()
  //   if (session) {
  //     await supabase.auth.signOut()
  //     redirect(303, "/")
  //   }
  // },
}

export const load: PageServerLoad = async ({ locals: { firebaseUser } }) => {
  if (!firebaseUser) {
    return {
      firebaseUser: null,
      userTemplates: [],
      recentTemplates: [],
      session: null,
    }
  }

  const userDefaultOrgId = await getUserDefaultOrgId({
    userId: firebaseUser.uid,
  })
  const userDefaultOrg = userDefaultOrgId
    ? await getOrgById(userDefaultOrgId)
    : null
  const userTemplates = await getUsersTemplate(firebaseUser.uid)

  const recentTemplates = userDefaultOrgId
    ? await getUserOrgTemplateDocs({
        uid: firebaseUser.uid,
        orgId: userDefaultOrgId,
        limit: 5,
        sortByCreatedAt: "desc",
      })
    : []

  return {
    currentOrg: userDefaultOrg,
    firebaseUser,
    userTemplates,
    recentTemplates,
    session: null,
  }
}
