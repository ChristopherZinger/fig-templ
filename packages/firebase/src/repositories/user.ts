import {
  getUserOrgJoinTableCollectionRef,
  getTemplatesCollectionRef,
  getUsersCollectionRef,
  getOrgCollectionRef,
} from "../utils/collection-refs";
import { addUserToOrg, createOrgWithName } from "./organization";
import type { Organization_FsDoc, Template_FsDoc } from "../utils/collections";
import { Transaction } from "firebase-admin/firestore";
import { log } from "@templetto/logging";
import { getUserOrgJoinTableDocRef } from "./user-org-joint-table";

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
  const userOrgJoinTableDoc = await getUserOrgJoinTableDocRef({
    uid,
    orgId,
  }).get();
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

export async function ensureUserAndOrgForAuthUser(
  t: Transaction,
  { uid, userName }: { uid: string; userName: string }
): Promise<void> {
  const userDocRef = getUsersCollectionRef().doc(uid);
  const userDoc = (await t.get(userDocRef)).data();

  if (!userDoc) {
    const orgDocRef = getOrgCollectionRef().doc();
    const userOrgJoinTableDocRef = getUserOrgJoinTableDocRef({
      uid,
      orgId: orgDocRef.id,
    });

    t.set(userDocRef, { uid, name: userName, defaultOrgId: orgDocRef.id });
    t.set(orgDocRef, { id: orgDocRef.id, name: "Personal Workspace" });
    t.set(userOrgJoinTableDocRef, { uid, orgId: orgDocRef.id });
    return;
  }

  const orgDocRef = getOrgCollectionRef().doc(userDoc.defaultOrgId);
  const userOrgJoinTableDocRef = getUserOrgJoinTableDocRef({
    uid,
    orgId: userDoc.defaultOrgId,
  });

  const [orgDoc, userOrgJoinTableDoc] = await Promise.all([
    t.get(orgDocRef),
    t.get(userOrgJoinTableDocRef),
  ]);

  if (!orgDoc.exists) {
    log.error("user_default_org_not_found", {
      uid,
      orgId: userDoc.defaultOrgId,
    });
    t.set(orgDocRef, { id: orgDocRef.id, name: "Personal Workspace" });
  }

  if (!userOrgJoinTableDoc.exists) {
    log.error("user_default_org_join_table_not_found", {
      uid,
      orgId: userDoc.defaultOrgId,
    });
    t.set(userOrgJoinTableDocRef, { uid, orgId: orgDocRef.id });
  }
}
