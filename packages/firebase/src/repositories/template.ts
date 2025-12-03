import { getTemplatesCollectionRef } from "../utils/collection-refs";
import { getBucket } from "../utils/storage";
import { getFirestore } from "../admin-init";
import { assertAccessToOrg } from "./user";
import { pipeline } from "stream/promises";
import fs from "fs";
import path from "path";

function getTmpFolder() {
  const TEMPL_DIR = path.join("/tmp", "templetto");
  const tmpPath = path.join(TEMPL_DIR, Date.now().toString());
  fs.mkdirSync(tmpPath, { recursive: true });

  return {
    tmpPath,
    cleanup: () => {
      console.log("cleaning up", tmpPath);
      fs.rmSync(tmpPath, { recursive: true });
    },
  };
}

export async function getTemplateContents({
  orgId,
  userId,
  templateId,
}: {
  orgId: string;
  userId: string;
  templateId: string;
}): Promise<string | null> {
  const pathInStorage = await getFirestore().runTransaction(async (t) => {
    await assertAccessToOrg({ orgId, uid: userId }, t);

    const templateRef = getTemplatesCollectionRef({ orgId }).doc(templateId);
    const templateDoc = (await t.get(templateRef)).data();

    return templateDoc?.pathInStorage || null;
  });
  if (!pathInStorage) {
    return null;
  }

  const templateFileRef = getBucket().file(pathInStorage);
  if (!(await templateFileRef.exists())) {
    return null;
  }

  const { tmpPath, cleanup } = getTmpFolder();
  const filePath = path.join(tmpPath, "output.html");
  await pipeline(
    templateFileRef.createReadStream(),
    fs.createWriteStream(filePath)
  );
  const htmlString = fs.readFileSync(filePath, "utf-8");

  cleanup();

  return htmlString;
}
