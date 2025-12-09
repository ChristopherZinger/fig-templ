import { getFirestore } from "../admin-init";
import { getArtifactsCollectionRef } from "../utils/collection-refs";
import { RATE_LIMIT_SETTINGS } from "@templetto/settings";
import { RateLimitError } from "@templetto/app-error";

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
