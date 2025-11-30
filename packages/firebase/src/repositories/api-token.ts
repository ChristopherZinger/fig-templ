import crypto from "crypto";
import { getOrgApiTokensCollectionRef } from "../utils/collection-refs";
import { getFirestore } from "../admin-init";
import { assertAccessToOrg } from "./user";
import { AppError } from "@templetto/app-error";
import { MAX_TOKENS_PER_ORG } from "../config/config";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getHashedToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function getApiTokens({
  userId,
  orgId,
}: {
  userId: string;
  orgId: string;
}): Promise<
  {
    token: string;
    userId: string;
    createdAt: Date;
    expiresAt: Date;
    orgId: string;
  }[]
> {
  await assertAccessToOrg({ uid: userId, orgId });
  const apiTokens = await getOrgApiTokensCollectionRef()
    .where("orgId", "==", orgId)
    .get();
  return apiTokens.docs.map((doc) => {
    const tokenDoc = doc.data();
    return {
      token: tokenDoc.token,
      userId: tokenDoc.userId,
      createdAt: tokenDoc.createdAt,
      expiresAt: tokenDoc.expiresAt,
      orgId: tokenDoc.orgId,
    };
  });
}

export async function createApiToken({
  orgId,
  userId,
}: {
  orgId: string;
  userId: string;
}): Promise<void> {
  await getFirestore().runTransaction(async (t) => {
    await assertAccessToOrg({ uid: userId, orgId }, t);

    const numApiTokens = (
      await getOrgApiTokensCollectionRef()
        .where("orgId", "==", orgId)
        .count()
        .get()
    ).data().count;
    if (numApiTokens >= MAX_TOKENS_PER_ORG) {
      throw new AppError("max_api_tokens_per_org_reached", { orgId });
    }

    const token = generateToken();
    const tokenHash = getHashedToken(token);
    const apiTokenDoc = getOrgApiTokensCollectionRef().doc(tokenHash);
    t.set(apiTokenDoc, {
      token,
      tokenHash,
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
    await assertAccessToOrg({ uid: userId, orgId }, t);
    const apiTokenDoc = getOrgApiTokensCollectionRef().doc(
      getHashedToken(tokenId)
    );
    t.delete(apiTokenDoc);
  });
}
