import { getFirestore } from "../admin-init";
import { getArtifactsCollectionRef } from "../utils/collection-refs";
import { RATE_LIMIT_SETTINGS } from "@templetto/settings";
import { RateLimitError } from "@templetto/app-error";
import { assertAccessToOrg } from "./user";
import { Artifact_FsDoc } from "../utils/collections";
import { Transaction } from "firebase-admin/firestore";

export async function createArtifact({
  orgId,
  templateId,
  filePathInStorage,
  downloadUrl,
}: {
  orgId: string;
  templateId: string;
  filePathInStorage: string;
  downloadUrl: string;
}): Promise<void> {
  const artifactDocRef = getArtifactsCollectionRef({ orgId }).doc();

  await getFirestore().runTransaction(async (t) => {
    // TODO assert access based on api call

    const countQuery = getArtifactsCollectionRef({ orgId }).count();
    const count = (await t.get(countQuery)).data().count;
    if (count >= RATE_LIMIT_SETTINGS.numArtifactsPerOrg) {
      throw new RateLimitError("num_artifacts_per_org_reached", "artifacts", {
        orgId,
        templateId,
      });
    }

    t.set(artifactDocRef, {
      id: artifactDocRef.id,
      orgId,
      templateId,
      filePathInStorage,
      downloadUrl,
      createdAt: new Date(),
    });
  });
}

export async function hasReachedArtifactsRateLimit({
  orgId,
}: {
  orgId: string;
}): Promise<boolean> {
  const countQuery = getArtifactsCollectionRef({ orgId }).count();
  return (
    (await countQuery.get()).data().count >=
    RATE_LIMIT_SETTINGS.numArtifactsPerOrg
  );
}

export async function getArtifactsByTemplateId(
  info: {
    orgId: string;
    templateId: string;
    userId: string;
  },
  t: Transaction
): Promise<Artifact_FsDoc[]> {
  if (!t) {
    return await getFirestore().runTransaction(async (t) => {
      return getArtifactsByTemplateIdTransaction(info, t);
    });
  }
  return getArtifactsByTemplateIdTransaction(info, t);
}

async function getArtifactsByTemplateIdTransaction(
  {
    orgId,
    templateId,
    userId,
  }: {
    orgId: string;
    templateId: string;
    userId: string;
  },
  t: Transaction
): Promise<Artifact_FsDoc[]> {
  await assertAccessToOrg({ orgId, uid: userId }, t);
  const artifacts = await t.get(
    getArtifactsCollectionRef({ orgId }).where("templateId", "==", templateId)
  );
  return artifacts.docs.map((doc) => doc.data());
}

export async function deleteArtifact(
  {
    orgId,
    artifactId,
    userId,
  }: {
    orgId: string;
    artifactId: string;
    userId: string;
  },
  t?: Transaction
): Promise<void> {
  if (!t) {
    return await getFirestore().runTransaction(async (t) => {
      return deleteArtifactTransaction({ orgId, artifactId, userId }, t);
    });
  }
  return await deleteArtifactTransaction({ orgId, artifactId, userId }, t);
}

async function deleteArtifactTransaction(
  {
    orgId,
    artifactId,
    userId,
  }: {
    orgId: string;
    artifactId: string;
    userId: string;
  },
  t: Transaction
): Promise<void> {
  await assertAccessToOrg({ orgId, uid: userId }, t);
  await t.delete(getArtifactsCollectionRef({ orgId }).doc(artifactId));
}
