import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ locals: { firebaseUser } }) => {
  return {
    isLoggedIn: !!firebaseUser,
    session: null,
  }
}
