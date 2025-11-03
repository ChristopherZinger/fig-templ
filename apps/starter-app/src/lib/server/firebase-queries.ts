import type { Template_FsDoc } from "@templetto/firebase"
import {
  getUserOrgIds,
  getUserOrgTemplateDocs,
} from "@templetto/firebase/repositories/user"

export async function getUsersTemplate(
  userUid: string,
): Promise<Template_FsDoc[]> {
  const orgIds = await getUserOrgIds({ uid: userUid })
  return (
    await Promise.all(
      orgIds.map((orgId) => getUserOrgTemplateDocs({ uid: userUid, orgId })),
    )
  ).flat()
}
