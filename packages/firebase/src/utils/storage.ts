import { getStorage } from "../admin-init";
import path from "path";

export function getBucket() {
  return getStorage().bucket();
}

export async function pushToStorage({
  localFilePath,
  destinationInStorage,
}: {
  localFilePath: string;
  destinationInStorage: string;
}): Promise<void> {
  const fileName = path.basename(localFilePath);

  if (!fileName) {
    throw new Error("expected_file_name");
  }

  const bucket = getBucket();

  await bucket.upload(localFilePath, {
    destination: destinationInStorage,
    contentType: "application/pdf",
    metadata: {
      contentDisposition: `attachment; filename="${fileName}"`,
    },
  });
}

export enum StorageDirectory {
  organizations = "organizations",
  templates = "templates",
  artifacts = "artifacts",
}
