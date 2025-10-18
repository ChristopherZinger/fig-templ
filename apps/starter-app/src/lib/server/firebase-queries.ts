import { firestore } from "./firebase-admin/firebase-admin-init"

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
export async function getUserOrgs(userUid: string): Promise<string[]> {
  const userCollectionRef = await firestore
    .collection("users")
    .doc(userUid)
    .get()
  const collectionRef = firestore.collection("user-organizations")
  console.log("getUserOrgs collectionRef")
  const querySnapshot = await collectionRef.doc("gPHxz7aKbLATXxNMtkTp").get()
  console.log("getUserOrgs querySnapshot")
  const res = querySnapshot.data()?.orgUid
  console.log("got result", res)
  return res ? [res] : []
}
export async function getUsersTemplate(userUid: string): Promise<Template[]> {
  const templates: Template[] = []
  const userOrgs = await getUserOrgs(userUid)
  for (const org of userOrgs) {
    const orgDoc = await firestore.collection("organizations").doc(org).get()
    if (orgDoc.exists) {
      const orgData = orgDoc.data()
      const orgTemplates = (
        await firestore
          .collection("organizations")
          .doc(org)
          .collection("templates")
          .get()
      ).docs.map((doc) => doc.data() as Template)
      templates.push(...orgTemplates)
    }
  }
  console.log("getUsersTemplate", templates)
  return templates
}
