import {
  getOrgCollectionRef,
  getUserOrgJoinTableCollectionRef,
} from "../utils/collection-refs";
import type { Organization_FsDoc } from "../utils/collections";

export async function getOrgById(
  orgId: string
): Promise<Organization_FsDoc | undefined> {
  const orgDoc = await getOrgCollectionRef().doc(orgId).get();
  return orgDoc.data();
}

export async function createOrgWithName(
  name: string
): Promise<Organization_FsDoc> {
  const orgDoc = getOrgCollectionRef().doc();
  await orgDoc.set({
    id: orgDoc.id,
    name,
  });
  return (await orgDoc.get()).data() as Organization_FsDoc;
}

export async function addUserToOrg({
  userId,
  orgId,
}: {
  userId: string;
  orgId: string;
}): Promise<void> {
  await getUserOrgJoinTableCollectionRef().doc(`${userId}:${orgId}`).set({
    orgId,
    uid: userId,
  });
}
