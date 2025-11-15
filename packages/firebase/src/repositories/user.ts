import {
  getUserOrgJoinTableCollectionRef,
  getTemplatesCollectionRef,
  getUsersCollectionRef,
} from "../utils/collection-refs";
import { addUserToOrg, createOrgWithName } from "./organization";
import type { Organization_FsDoc, Template_FsDoc } from "../utils/collections";

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
  limit,
  sortByCreatedAt,
}: {
  uid: string;
  orgId: string;
  limit?: number;
  sortByCreatedAt?: "asc" | "desc";
}): Promise<Template_FsDoc[]> {
  const hasAccess = await userHasAccessToOrg({ uid, orgId });
  if (!hasAccess) {
    return [];
  }

  let query = getTemplatesCollectionRef({ orgId });

  if (sortByCreatedAt) {
    query = query.orderBy("createdAt", sortByCreatedAt) as any;
  }

  if (limit) {
    query = query.limit(limit) as any;
  }

  return (await query.get()).docs.map((doc) => doc.data());
}

export async function createUserPersonalOrg({
  userId,
}: {
  userId: string;
}): Promise<Organization_FsDoc> {
  const userPersonalOrg = await createOrgWithName("Personal Workspace");
  await addUserToOrg({ userId, orgId: userPersonalOrg.id });
  return userPersonalOrg;
}

export async function updateUserDefaultOrg({
  userId,
  orgId,
}: {
  userId: string;
  orgId: string;
}): Promise<void> {
  await getUsersCollectionRef().doc(userId).update({ defaultOrgId: orgId });
}
