import { storage } from "../admin-init";
import path from "path";

const DEFAULT_BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET_NAME;

export function getBucket() {
  return storage.bucket(DEFAULT_BUCKET_NAME);
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

  bucket.upload(localFilePath, {
    destination: destinationInStorage,
    contentType: "application/pdf",
    metadata: {
      contentDisposition: `attachment; filename="${fileName}"`,
    },
  });
}
