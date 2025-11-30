import {
  getUserOrgJoinTableCollectionRef,
  getTemplatesCollectionRef,
  getUsersCollectionRef,
  getOrgCollectionRef,
} from "../utils/collection-refs";
import { addUserToOrg, createOrgWithName } from "./organization";
import type {
  Organization_FsDoc,
  Template_FsDoc,
  User_FsDoc,
} from "../utils/collections";
import { Transaction } from "firebase-admin/firestore";
import { log } from "@templetto/logging";
import { getUserOrgJoinTableDocRef } from "./user-org-joint-table";
import { RestrictedAccessError } from "../utils/errors";
import { AppError } from "@templetto/app-error";

export async function expectUserById(uid: string): Promise<User_FsDoc> {
  const userDoc = (await getUsersCollectionRef().doc(uid).get()).data();
  if (!userDoc) {
    throw new AppError("user_not_found", { uid });
  }
  return userDoc;
}

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

type HaveAccessToOrgParameters = {
  uid: string;
  orgId: string;
};

async function haveAccessToOrg(
  info: HaveAccessToOrgParameters
): Promise<boolean>;
async function haveAccessToOrg(
  info: HaveAccessToOrgParameters,
  t: Transaction
): Promise<boolean>;
async function haveAccessToOrg(
  info: HaveAccessToOrgParameters,
  t?: Transaction
): Promise<boolean> {
  if (t instanceof Transaction) {
    const userOrgJoinTableDoc = await t.get(getUserOrgJoinTableDocRef(info));
    return userOrgJoinTableDoc.exists;
  }
  const userOrgJoinTableDoc = await getUserOrgJoinTableDocRef(info).get();
  return userOrgJoinTableDoc.exists;
}

export async function assertAccessToOrg(
  info: HaveAccessToOrgParameters
): Promise<void>;
export async function assertAccessToOrg(
  info: HaveAccessToOrgParameters,
  t: Transaction
): Promise<void>;
export async function assertAccessToOrg(
  info: HaveAccessToOrgParameters,
  t?: Transaction
): Promise<void> {
  const hasAccess = t
    ? await haveAccessToOrg(info, t)
    : await haveAccessToOrg(info);
  if (!hasAccess) {
    throw new RestrictedAccessError("user_does_not_have_access_to_org", {
      orgId: info.orgId,
      userId: info.uid,
    });
  }
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
  // TODO transaction!
  const hasAccess = await haveAccessToOrg({ uid, orgId });
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
