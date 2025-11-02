import {
  getUserOrgJoinTableCollectionRef,
  getTemplatesCollectionRef,
} from "@templetto/firebase"

export type Template = {
  id: string
  name: string
  pathInStorage: string
}
export type Organization = {
  id: string
  name: string
  templates: string[]
}
export async function getUserOrgIds(userUid: string): Promise<string[]> {
  const userOrgIds = (
    await getUserOrgJoinTableCollectionRef().where("uid", "==", userUid).get()
  ).docs.map((doc) => doc.data().orgId)
  return userOrgIds
}
export async function getUsersTemplate(userUid: string): Promise<Template[]> {
  const userOrgs = await getUserOrgIds(userUid)
  const templates: Template[] = []
  for (const org of userOrgs) {
    const templateCollectionRef = getTemplatesCollectionRef({ orgId: org })
    const orgTemplates = (await templateCollectionRef.get()).docs.map(
      (doc) => doc.data() as Template,
    )
    templates.push(...orgTemplates)
  }
  return templates
}
