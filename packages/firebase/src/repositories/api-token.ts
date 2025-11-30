import { type ApiToken_FsDoc } from "../utils/collections";
import { getOrgApiTokensCollectionRef } from "../utils/collection-refs";
import { getFirestore } from "../admin-init";
import { assertAccessToOrg } from "./user";

export async function getApiTokens({
  userId,
  orgId,
}: {
  userId: string;
  orgId: string;
}): Promise<ApiToken_FsDoc[]> {
  await assertAccessToOrg({ uid: userId, orgId });
  const apiTokens = await getOrgApiTokensCollectionRef()
    .where("orgId", "==", orgId)
    .get();
  return apiTokens.docs.map((doc) => doc.data());
}

export async function createApiToken({
  orgId,
  userId,
}: {
  orgId: string;
  userId: string;
}): Promise<void> {
  await getFirestore().runTransaction(async (t) => {
    await assertAccessToOrg({ t, uid: userId, orgId });
    const apiTokenDoc = getOrgApiTokensCollectionRef().doc();
    t.set(apiTokenDoc, {
      token: apiTokenDoc.id, // TODO this should be hashed
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
      orgId,
      userId,
    });
  });
}

export async function deleteApiToken({
  orgId,
  userId,
  tokenId,
}: {
  orgId: string;
  userId: string;
  tokenId: string;
}): Promise<void> {
  await getFirestore().runTransaction(async (t) => {
    await assertAccessToOrg({ t, uid: userId, orgId });
    const apiTokenDoc = getOrgApiTokensCollectionRef().doc(tokenId);
    t.delete(apiTokenDoc);
  });
}
