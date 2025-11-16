import { getTemplatesCollectionRef } from "../utils/collection-refs";
import { getBucket } from "../utils/storage";
import { log } from "@templetto/logging";
import { AppError } from "@templetto/app-error";
import { expectDocInCollection } from "../utils/retrieve-utils";

export async function getTemplateContents({
  orgId,
  templateId,
}: {
  orgId: string;
  templateId: string;
}): Promise<string> {
  const templateDocRef = getTemplatesCollectionRef({ orgId }).doc(templateId);
  const { pathInStorage: templatePathInStorage } =
    await expectDocInCollection(templateDocRef);

  const bucket = getBucket();
  const templateRef = bucket.file(templatePathInStorage);

  if (!(await templateRef.exists())) {
    log.debug("template_not_found_in_storage", {
      templatePathInStorage,
      orgId,
      templateId,
    });
    throw new AppError("template_not_found_in_storage", {
      templateId,
      orgId,
      pathInStorage: templatePathInStorage,
    });
  }

  try {
    const [buffer] = await templateRef.download();
    return buffer.toString("utf-8");
  } catch (error) {
    log.error("failed_to_download_template", { error, templateId, orgId });
    throw new AppError("failed_to_download_template", {
      templateId,
      orgId,
      error,
    });
  }
}
