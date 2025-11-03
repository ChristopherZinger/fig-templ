import {
  getUserOrgJoinTableCollectionRef,
  getTemplatesCollectionRef,
} from "../utils/collection-refs";
import type { Template_FsDoc } from "../utils/collections";

export async function getUserOrgIds({
  uid,
}: {
  uid: string;
}): Promise<string[]> {
  const orgIds = (
    await getUserOrgJoinTableCollectionRef().where("uid", "==", uid).get()
  ).docs.map((doc) => doc.data().orgId);

  return orgIds;
}

export async function userHasAccessToOrg({
  uid,
  orgId,
}: {
  uid: string;
  orgId: string;
}): Promise<boolean> {
  const userOrgJoinTableDoc = await getUserOrgJoinTableCollectionRef()
    .doc(`${uid}:${orgId}`)
    .get();
  return userOrgJoinTableDoc.exists;
}

export async function getUserOrgTemplateDocs({
  uid,
  orgId,
}: {
  uid: string;
  orgId: string;
}): Promise<Template_FsDoc[]> {
  const hasAccess = await userHasAccessToOrg({ uid, orgId });
  if (!hasAccess) {
    return [];
  }
  return (await getTemplatesCollectionRef({ orgId }).get()).docs.map((doc) =>
    doc.data()
  );
}
