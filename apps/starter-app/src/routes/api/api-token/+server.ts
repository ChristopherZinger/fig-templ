import { json, error } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import z from "zod"
import {
  createApiToken,
  deleteApiToken,
  getApiTokens,
} from "@templetto/firebase/repositories/api-token"
import { RestrictedAccessError } from "@templetto/firebase/errors"
import { expectUserById } from "@templetto/firebase"

export const GET: RequestHandler = async ({ locals }) => {
  const { firebaseUser } = locals

  console.log("firebaseUser", firebaseUser)

  if (!firebaseUser) {
    error(401, "Unauthorized")
  }

  const userDoc = await expectUserById(firebaseUser.uid)
  try {
    const apiTokens = await getApiTokens({
      userId: firebaseUser.uid,
      orgId: userDoc.defaultOrgId,
    })
    return json(apiTokens)
  } catch (e) {
    if (e instanceof RestrictedAccessError) {
      error(403, "Forbidden")
    }
    error(500, "Internal server error")
  }
}

export const PUT: RequestHandler = async ({ locals }) => {
  const { firebaseUser } = locals

  if (!firebaseUser) {
    error(401, "Unauthorized")
  }

  const userDoc = await expectUserById(firebaseUser.uid)
  try {
    await createApiToken({
      userId: firebaseUser.uid,
      orgId: userDoc.defaultOrgId,
    })
    return json({})
  } catch (e) {
    if (e instanceof RestrictedAccessError) {
      error(403, "Forbidden")
    }
    error(500, "Internal server error")
  }
}

export const DELETE: RequestHandler = async ({ locals, request }) => {
  const { firebaseUser } = locals

  if (!firebaseUser) {
    error(401, "Unauthorized")
  }

  const parseResult = z
    .object({ tokenId: z.string() })
    .safeParse(await request.json())
  if (!parseResult.success) {
    error(400, "Invalid request body")
  }

  const userDoc = await expectUserById(firebaseUser.uid)
  try {
    await deleteApiToken({
      orgId: userDoc.defaultOrgId,
      userId: firebaseUser.uid,
      tokenId: parseResult.data.tokenId,
    })
    return json({})
  } catch (e) {
    if (e instanceof RestrictedAccessError) {
      error(403, "Forbidden")
    }
    error(500, "Internal server error")
  }
}
